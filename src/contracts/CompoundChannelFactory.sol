pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

interface CERC20 {
  function mint(uint256) external returns (uint256);
  function redeem(uint256) external returns (uint256);
  function balanceOf(address) external view returns (uint256);
  function borrow(uint256) external returns (uint256);
  function borrowBalanceCurrent(address account) external returns (uint);
  function repayBorrow(uint repayAmount) external returns (uint);
}

interface CETH {
  function mint() external payable;
  function exchangeRateCurrent() external returns (uint256);
  function supplyRatePerBlock() external returns (uint256);
  function redeem(uint256) external returns (uint256);
  function redeemUnderlying(uint256) external returns (uint256);
  function balanceOf(address) external view returns (uint256);
  function borrow(uint256) external returns (uint256);
  function borrowBalanceCurrent(address account) external returns (uint);
  function repayBorrow() external payable;
}

interface Comptroller {
  function markets(address) external returns (bool, uint256);
  function enterMarkets(address[] calldata) external returns (uint256[] memory);
  function getAccountLiquidity(address) external view returns (uint256, uint256, uint256);
}

contract EthChannel {
  using SafeMath for uint256;
//  State Variables
  uint256 public underlyingBalance; // underlying asset balance
  address payable public sender;
  address payable public recipient;
  uint256 public endTime;
  uint8 public channelNonce;
  CETH public cEther;
  CompoundChannelFactory public compFactory;

//   Events
    // Need to add events
  event EthDeposited(address depositor, uint256 amount);

  constructor(
    address payable _sender,
    address payable _recipient,
    uint256 _endTime,
    address _cEtherAddress,
    address _factoryAddress
    ) public {
    sender = _sender;
    recipient = _recipient;
    endTime = _endTime;
    cEther = CETH(_cEtherAddress);
    compFactory = CompoundChannelFactory(_factoryAddress);
  }

  function depositEth() public payable returns(bool) {
    cEther.mint{gas: 250000, value: msg.value}(); //0.6.0 syntax
    underlyingBalance = underlyingBalance.add(msg.value); // update underlying asset balance
    emit EthDeposited(msg.sender, msg.value);
    return true;
  }

  function forceClose() public {
    require(now > endTime, 'too early to close');
    require(msg.sender == sender, 'nonsender address');
    underlyingBalance = 0;
    
    uint256 cEthBalance = cEther.balanceOf(address(this));
    require(cEther.redeem(cEthBalance) == 0, "redeem error");
    uint256 balance = address(this).balance;
    sender.transfer(balance);
  }

  function close(
    uint256 _amount,
    bytes memory _signature
  ) public {
    require(msg.sender == recipient, 'nonrecipient address');

    require(compFactory.checkSignature(
      sender,
      address(this),
      channelNonce,
      _amount,
      _signature
    ), 'invalid signature');

    channelNonce += 1;
    underlyingBalance = 0;
    // Redeem Tokens
    uint256 cEthBalance = cEther.balanceOf(address(this));
    require(cEther.redeem(cEthBalance) == 0, "redeem error");

    uint256 balance = address(this).balance;
    uint256 toRecipient = balance < _amount ? balance : _amount;
    recipient.transfer(toRecipient);
    if (toRecipient < balance) sender.transfer(balance.sub(toRecipient));
  }

  function borrowEthAgainstERC20(
    address _tokenGive, 
    address _cTokenGive, 
    uint256 _giveAmount,
    uint256 _getAmount,
    address _compTrollAddress
    ) public {
    require(address(cEther) != _cTokenGive);
    IERC20 tokenGive = IERC20(_tokenGive);
    CERC20 cTokenGive = CERC20(_cTokenGive);
    Comptroller comptroller = Comptroller(_compTrollAddress);
    // Move allowance to channel
    tokenGive.transferFrom(msg.sender, address(this), _giveAmount);

    // Supply Colateral for borrow
    require(tokenGive.approve(_cTokenGive, _giveAmount), 'approval error');
    require(cTokenGive.mint(_giveAmount) == 0, 'minting error');

    // Enter the market
    address[] memory cTokens = new address[](1);
    cTokens[0] = _cTokenGive;
    uint256[] memory errors = comptroller.enterMarkets(cTokens);
    if (errors[0] != 0) {
      revert("Comptroller.enterMarkets failed.");
    }
    cEther.borrow(_getAmount);
    underlyingBalance = underlyingBalance.add(_getAmount); // update underlying asset balance
    cEther.mint{gas: 250000, value: _getAmount}(); //0.6.0 syntax
  }

  function repayEthBorrowed() public payable {
    uint received = msg.value;
    uint256 repayAmount = cEther.borrowBalanceCurrent(address(this));

    if(received > repayAmount) {
      cEther.repayBorrow{value: repayAmount}();
      msg.sender.transfer(received - repayAmount);
    }
    else {
      cEther.repayBorrow{value: received}();
    }
  }

  function withdrawLoanedERC20(address _cTokenGave, address _tokenGave) public {
    require(_cTokenGave != address(cEther));
    uint256 repayAmount = cEther.borrowBalanceCurrent(address(this));
    require(repayAmount == 0, 'need to repay debt');

    CERC20 cTokenGave = CERC20(_cTokenGave);
    IERC20 tokenGave = IERC20(_tokenGave);

    uint256 cTokenBalance = cTokenGave.balanceOf(address(this));
    require(cTokenGave.redeem(cTokenBalance) == 0, 'redeem error');
    uint256 tokenBalance = tokenGave.balanceOf(address(this));
    tokenGave.transfer(sender, tokenBalance);
  }
  
  fallback() external payable { } //Needed to recieve ether
  
}

contract Erc20Channel {
  using SafeMath for uint256;
//  State Variables
  uint256 public underlyingBalance; // underlying asset balance
  address payable public sender;
  address payable public recipient;
  uint256 public endTime;
  uint8 public channelNonce;
  IERC20 public token;
  CERC20 public cToken;
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
    token = IERC20(_tokenAddress); // zero address if underlying is Ether 
    cToken = CERC20(_cTokenAddress);
    compFactory = CompoundChannelFactory(_factoryAddress);
  }

  function depositERC20(uint256 _amount) public returns(bool) {
    token.transferFrom(msg.sender, address(this), _amount);
    underlyingBalance = underlyingBalance.add(_amount); // update underlying asset balance
    require(token.approve(address(cToken), _amount), 'approval error');
    require(cToken.mint(_amount) == 0, 'minting error');
    emit FundsDeposited(msg.sender, _amount, address(token));
    return true;
  }

  function forceClose() public {
    require(now > endTime, 'too early to close');
    require(msg.sender == sender, 'nonsender address');
    underlyingBalance = 0;
    
    uint256 cTokenBalance = cToken.balanceOf(address(this));
    require(cToken.redeem(cTokenBalance) == 0, "redeem error");
    uint256 balance = token.balanceOf(address(this));
    token.transfer(sender, balance);
  }

  function close(
    uint256 _amount,
    bytes memory _signature
  ) public {
    require(msg.sender == recipient, 'nonrecipient address');

    require(compFactory.checkSignature(
      sender,
      address(this),
      channelNonce,
      _amount,
      _signature
    ), 'invalid signature');

    channelNonce += 1;
    underlyingBalance = 0;
    // Redeem Tokens
    uint256 cTokenBalance = cToken.balanceOf(address(this));
    require(cToken.redeem(cTokenBalance) == 0, "redeem error");

    uint256 balance = token.balanceOf(address(this));
    uint256 toRecipient = balance < _amount ? balance : _amount;
    require(token.transfer(recipient, toRecipient), "transfer error");
    if (toRecipient < balance) token.transfer(sender, balance.sub(toRecipient));
  }

  function borrowERC20AgainstERC20(
    address _tokenGive, 
    address _cTokenGive, 
    uint256 _giveAmount,
    uint256 _getAmount,
    address _compTrollAddress
    ) public {
    // Prevents from entering the market of the channel asset
    require(address(cToken) != _cTokenGive);

    // Contract Instances
    IERC20 tokenGive = IERC20(_tokenGive);
    CERC20 cTokenGive = CERC20(_cTokenGive);
    Comptroller comptroller = Comptroller(_compTrollAddress);

    // Move allowance to channel
    tokenGive.transferFrom(msg.sender, address(this), _giveAmount);

    // Supply Colateral for borrow
    require(tokenGive.approve(_cTokenGive, _giveAmount), 'approval error');
    require(cTokenGive.mint(_giveAmount) == 0, 'minting error');

    // Enter the market
    address[] memory cTokens = new address[](1);
    cTokens[0] = _cTokenGive;
    uint256[] memory errors = comptroller.enterMarkets(cTokens);
    if (errors[0] != 0) {
      revert("Comptroller.enterMarkets failed.");
    }
    cToken.borrow(_getAmount);
    underlyingBalance = underlyingBalance.add(_getAmount); // update underlying asset balance
    // Takes borrow amount and converts back to cToken
    token.approve(address(cToken), _getAmount);
    require(cToken.mint(_getAmount) == 0, 'minting error');
  }

  function borrowERC20AgainstETH(
    address _cEthGive, 
    uint256 _getAmount,
    address _compTrollAddress
    ) public payable {
    require(address(cToken) != _cEthGive);

    // Contract Instances
    CETH cEthGive = CETH(_cEthGive);
    Comptroller comptroller = Comptroller(_compTrollAddress);
    
    // Supply Colateral for borrow
    cEthGive.mint{gas: 250000, value: msg.value}(); //0.6.0 syntax

    // Enter the market
    address[] memory cTokens = new address[](1);
    cTokens[0] = _cEthGive;
    uint256[] memory errors = comptroller.enterMarkets(cTokens);
    if (errors[0] != 0) {
      revert("Comptroller.enterMarkets failed.");
    }
    cToken.borrow(_getAmount);
    underlyingBalance = underlyingBalance.add(_getAmount); // update underlying asset balance
    // Takes borrow amount and converts back to cToken
    token.approve(address(address(cToken)), _getAmount);
    require(cToken.mint(_getAmount) == 0, 'minting error');
  }

  function repayERC20Borrowed() public {
    uint256 allowance = token.allowance(msg.sender, address(this));
    uint256 repayAmount = cToken.borrowBalanceCurrent(address(this));

    if(allowance > repayAmount) {
      token.transfer(address(this), repayAmount);
      cToken.repayBorrow(repayAmount);
    }

    else {
      token.transfer(address(this), allowance);
      cToken.repayBorrow(allowance);
    }
  }

  function withdrawLoanedERC20(address _tokenGave, address _cTokenGave) public {
    require(_tokenGave != address(token));
    require(_cTokenGave != address(cToken));

    uint256 repayAmount = cToken.borrowBalanceCurrent(address(this));
    require(repayAmount == 0, 'need to repay debt');

    CERC20 cTokenGave = CERC20(_cTokenGave);
    IERC20 tokenGave = IERC20(_tokenGave);
    
    uint256 cTokenBalance = cTokenGave.balanceOf(address(this));
    require(cTokenGave.redeem(cTokenBalance) == 0, 'redeem error');
    uint256 tokenBalance = tokenGave.balanceOf(address(this));
    tokenGave.transfer(sender, tokenBalance);
  }

  function withdrawLoanedEth(address _cEth) public {
    uint256 repayAmount = cToken.borrowBalanceCurrent(address(this));
    require(repayAmount == 0, 'need to repay debt');

    CETH cEther = CETH(_cEth);
    uint256 cEthBalance = cEther.balanceOf(address(this));
    require(cEther.redeem(cEthBalance) == 0, 'redeem error');
    sender.transfer(address(this).balance);
  }
  
  fallback() external payable { } //Needed to recieve ether
}

contract CompoundChannelFactory {
  using ECDSA for bytes32;
  // State Variables
  mapping(address => address[]) public senderRegistery;
  mapping(address => address[]) public recipientRegistery;
  mapping(address => uint8) public senderCount;
  mapping(address => uint8) public recipientCount;

  // Signature Information
  uint256 constant chainId = 42; //Kovan
  bytes32 constant salt = 0xf2e421f4a3edcb9b1111d503bfe733db1e3f6cdc2b7971ee739626c97e86a558;

  string private constant EIP712_DOMAIN = "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)";
  string private constant PAYMENT_TYPE = "Payment(uint256 amount,uint8 nonce)";

  bytes32 private constant EIP712_DOMAIN_TYPEHASH = keccak256(abi.encodePacked(EIP712_DOMAIN));
  bytes32 private constant PAYMENT_TYPEHASH = keccak256(abi.encodePacked(PAYMENT_TYPE));

  struct Payment {
    uint256 amount;
    uint8 nonce;
  }

  // Events
  event ChannelCreated(address channelAddress, address sender, address recipient);

  function createErc20Channel(
    address payable _recipient,
    uint256 _endTime,
    address _tokenAddress,
    address _cTokenAddress
    ) public returns(bool) {

    // Creates new Channel Contract
    Erc20Channel compChan = new Erc20Channel(
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
    senderCount[msg.sender] += 1;
    recipientCount[_recipient] += 1;
    emit ChannelCreated(address(compChan), msg.sender, _recipient);
    return true;
  }
  
  function createEthChannel(
    address payable _recipient,
    uint256 _endTime,
    address _cEthAddress
    ) public returns(bool) {

    // Creates new Channel Contract
    EthChannel ethChan = new EthChannel(
      msg.sender,
      _recipient,
      _endTime,
      _cEthAddress,
      address(this) // Factory Address
    );

    // Record new channel information
    senderRegistery[msg.sender].push(address(ethChan));
    recipientRegistery[_recipient].push(address(ethChan));
    senderCount[msg.sender] += 1;
    recipientCount[_recipient] += 1;
    emit ChannelCreated(address(ethChan), msg.sender, _recipient);
    return true;
  }

  function hashPayment(
    Payment memory payment,
    address _channelAddress
    ) private pure returns (bytes32){

    bytes32 DOMAIN_SEPARATOR = keccak256(abi.encode(
    EIP712_DOMAIN_TYPEHASH,
    keccak256("Compound Channels"),
    keccak256("1"),
    chainId,
    _channelAddress, // address of the channel that the message is for
    salt
    ));

    return keccak256(abi.encodePacked(
      "\x19\x01",
      DOMAIN_SEPARATOR,
      keccak256(abi.encode(
        PAYMENT_TYPEHASH,
        payment.amount,
        payment.nonce
      ))
    ));
  }

  function checkSignature(
    address _sender,
    address _channelAddress,
    uint8 _channelNonce,
    uint256 _amount,
    bytes memory _signature
    ) public pure returns (bool) {
      Payment memory payment = Payment({
        amount: _amount,
        nonce: _channelNonce
      });

      bytes32 hash = hashPayment(payment, _channelAddress);
      return _sender == hash.recover(_signature);
  }
}