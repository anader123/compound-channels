pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/cryptography/ECDSA.sol";

contract CompoundChannel {
  using ECDSA for bytes32;

//  State Variables
  address payable public sender;
  address payable public recipient;
  uint256 public endTime;
  IERC20 public token;
  CompoundContractInterface cToken;
  address public factoryAddress;

//   Events
    // Need to add events
//   event FundsDeposited(address depositor, uint256 amount, address TokenAddress);

  constructor(
    address payable _sender,
    address payable _recipient,
    uint256 _endTime,
    address _tokenAddress,
    address _cTokenAddress
    ) public {
    sender = _sender;
    recipient = _recipient;
    endTime = _endTime;
    token = IERC20(_tokenAddress);
    // Kovan cDai address
    // cToken = CompoundContractInterface(0xe7bc397DBd069fC7d0109C0636d06888bb50668c);
    cToken = CompoundContractInterface(_cTokenAddress);
  }

  function depositFunds() public payable returns(bool) {
    uint256 tokenBalance = token.balanceOf(address(this));
    assert(tokenBalance > 0);

    require(token.approve(address(cToken), tokenBalance), 'approval error');
    require(cToken.mint(tokenBalance) == 0, 'minting error');
    // emit FundsDeposited(msg.sender, _depositAmount, address(token));
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

  function close(uint256 _value, bytes memory _signature) public {
    require(msg.sender == recipient);

    bytes32 hash = keccak256(abi.encodePacked(_value, address(this))).toEthSignedMessageHash();
    address signer = hash.recover(_signature);
    require(signer == sender);

    // Redeem Tokens
    uint256 cTokenBalance = cToken.balanceOf(address(this));
    require(cToken.redeem(cTokenBalance) == 0, "redeem error");

    uint256 balance = token.balanceOf(address(this));
    uint256 toRecipient = balance < _value ? balance : _value;
    require(token.transfer(recipient, toRecipient), "transfer error");

    if (toRecipient < balance) token.transfer(sender, balance - toRecipient);
  }
}
