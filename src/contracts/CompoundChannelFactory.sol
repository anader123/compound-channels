pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface CompoundContractInterface {
  function mint(uint mintAmount) external returns (uint);
  function redeem(uint redeemTokens) external returns (uint);
  function balanceOf(address guy) external view returns (uint);
}

contract CompoundChannel {
//  State Variables
  address payable public sender;
  address payable public recipient;
  uint256 public endTime;
  IERC20 public token;
  CompoundContractInterface cToken;
  CompoundChannelFactory public compFactory;

//   Events
    // Need to add events
  event FundsDeposited(address depositor, uint256 amount, address TokenAddress);

  constructor(
    address payable _sender,
    address payable _recipient,
    uint256 _endTime,
    address _tokenAddress,
    address _cTokenAddress,
    address _factoryAddress
    ) public {
    sender = _sender;
    recipient = _recipient;
    endTime = _endTime;
    token = IERC20(_tokenAddress);
    cToken = CompoundContractInterface(_cTokenAddress);
    compFactory = CompoundChannelFactory(_factoryAddress);
  }

  function depositFunds() public returns(bool) {
    uint256 tokenAllowance = token.allowance(msg.sender, address(this));
    require(tokenAllowance > 0, 'not enough allowance');
    token.transferFrom(msg.sender, address(this), tokenAllowance);
    uint256 tokenBalance = token.balanceOf(address(this));
    require(tokenBalance > 0, 'not enough allowance');

    require(token.approve(address(cToken), tokenBalance), 'approval error');
    require(cToken.mint(tokenBalance) == 0, 'minting error');
    emit FundsDeposited(msg.sender, _depositAmount, address(token));
    return true;
  }

  function forceClose() public {
    require(now > endTime);
    require(msg.sender == sender);
    uint256 cTokenBalance = cToken.balanceOf(address(this));
    require(cToken.redeem(cTokenBalance) == 0, "redeem error");
    uint256 balance = token.balanceOf(address(this));
    token.transfer(sender, balance);
  }

  function close(
    Payment memory payment,
    address _sender,
    address _channelAddress,
    uint8 sigV,
    bytes32 sigR,
    bytes32 sigS
  ) public {
    require(msg.sender == recipient, 'nonrecipient address');

    require(compFactory.checkSignature(
      _sender,
      _channelAddress,
      recipient,
      payment,
      sigV,
      sigR,
      sigS
    ), 'invalid signature');

    // Redeem Tokens
    uint256 cTokenBalance = cToken.balanceOf(address(this));
    require(cToken.redeem(cTokenBalance) == 0, "redeem error");

    uint256 balance = token.balanceOf(address(this));
    uint256 toRecipient = balance < _value ? balance : _value;
    require(token.transfer(recipient, toRecipient), "transfer error");

    if (toRecipient < balance) token.transfer(sender, balance - toRecipient);
  }
}

contract CompoundChannelFactory {
  // State Variables
  mapping(address => address[]) public senderRegistery;
  mapping(address => address[]) public recipientRegistery;

  // Signature Information
  uint256 constant chainId = 42;
  struct Payment {
    uint256 amount;
  }
  string private constant PAYMENT_TYPEHASH = "Payment(uin256 amount)";
  bytes32 constant salt = 0xf2e421f4a3edcb9b1111d503bfe733db1e3f6cdc2b7971ee739626c97e86a558;
  string private constant EIP712_DOMAIN_TYPEHASH =
  "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)";

  // Events
  event ChannelCreated(address channelAddress, address sender, address recipient);

  function createChannel(
    address payable _recipient,
    uint256 _endTime,
    uint256 _depositAmount,
    address _tokenAddress,
    address _cTokenAddress
    ) public returns(bool) {

    // Creates new Channel Contract
    CompoundChannel compChan = new CompoundChannel(
      msg.sender,
      _recipient,
      _endTime,
      _tokenAddress,
      _cTokenAddress,
      address(this) // Factory Address
    );

    // Record new channel information
    senderRegistery[msg.sender].push(address(compChan));
    recipientRegistery[_recipient].push(address(compChan));
    emit ChannelCreated(address(compChan), msg.sender, _recipient);
    return true;
  }

  function hashPayment(
    Payment memory payment,
    address _channelAddress
    ) private pure returns (bytes32){

    bytes32 DOMAIN_SEPARATOR = keccak256(abi.encode(
    EIP712_DOMAIN_TYPEHASH,
    keccak256("Compound Channels"),
    keccak256("42"),
    chainId,
    _channelAddress,
    salt
    ));

    return keccak256(abi.encodePacked(
      "\\x19\\x01",
      DOMAIN_SEPARATOR,
      keccak256(abi.encode(
        PAYMENT_TYPEHASH,
        payment.amount
      ))
    ));
  }

  function checkSignature(
    address _sender,
    address _channelAddress,
    address _recipient,
    Payment memory payment,
    uint8 sigV,
    bytes32 sigR,
    bytes32 sigS
    ) public pure returns (bool) {
      return _sender == ecrecover(hashPayment(payment, _channelAddress), sigV, sigR, sigS);
  }
}