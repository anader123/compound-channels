pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

interface CompChannelFactory {
  function checkSignature(address, address, uint8, uint256, bytes calldata) external returns (bool);
}

interface CERC20 {
  function mint(uint256) external returns (uint256);
  function redeem(uint256) external returns (uint256);
  function balanceOf(address) external view returns (uint256);
  function borrow(uint256) external returns (uint256);
  function borrowBalanceCurrent(address account) external view returns (uint);
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
  function borrowBalanceCurrent(address account) external view returns (uint);
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
  address public factoryAddress;
  bool initialized;

//   Events
    // Need to add events
  event EthDeposited(address depositor, uint256 amount);
  // event ChannelForceClosed();
  // event ChannelClose();
  // event FundsBorrowed();

  function init(
    address payable _sender,
    address payable _recipient,
    uint256 _endTime,
    address _cEtherAddress,
    address  _factoryAddress
  ) public returns (bool) {
    // Makes sure the function can only be called once 
    require(initialized == false, 'already initialized');
    initialized = true;

    factoryAddress = _factoryAddress;
    sender = _sender;
    recipient = _recipient;
    endTime = _endTime;
    cEther = CETH(_cEtherAddress);

    return true;
  }

  function depositEth() public payable returns(bool) {
    cEther.mint{gas: 250000, value: msg.value}(); //0.6.0 syntax
    // cEther.mint.value(msg.value).gas(250000); //0.5.0 syntax
    underlyingBalance = underlyingBalance.add(msg.value); // update underlying asset balance
    emit EthDeposited(msg.sender, msg.value);
    return true;
  }

  function forceClose() public {
    require(now > endTime, 'too early to close');
    require(msg.sender == sender, 'nonsender address');
    underlyingBalance = 0;
    channelNonce += 1;
    
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
    CompChannelFactory compFactory = CompChannelFactory(factoryAddress);

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
    // cEther.mint.value(msg.value).gas(250000); //0.5.0 syntax
  }

  function repayEthBorrowed() public payable {
    uint received = msg.value;
    uint256 repayAmount = cEther.borrowBalanceCurrent(address(this));

    if(received > repayAmount) {
      cEther.repayBorrow{value: repayAmount}(); // 0.6.0 syntax
    //   cEther.repayBorrow.value(repayAmount); // 0.5.0 syntax
      msg.sender.transfer(received - repayAmount);
    }
    else {
      cEther.repayBorrow{value: received}(); // 0.6.0 syntax
    // cEther.repayBorrow.value(received); // 0.5.0 syntax
    }
  }

  function withdrawLoanedERC20(address _cTokenGave, address _tokenGave) public {
    require(_tokenGave != address(token));
    require(_cTokenGave != address(cEther));
    require(sender == msg.sender);
    
    uint256 repayAmount = cEther.borrowBalanceCurrent(address(this));
    require(repayAmount == 0, 'need to repay debt');

    CERC20 cTokenGave = CERC20(_cTokenGave);
    IERC20 tokenGave = IERC20(_tokenGave);

    uint256 cTokenBalance = cTokenGave.balanceOf(address(this));
    require(cTokenGave.redeem(cTokenBalance) == 0, 'redeem error');
    uint256 tokenBalance = tokenGave.balanceOf(address(this));
    tokenGave.transfer(sender, tokenBalance);
  }
  
  fallback() external payable { }
//   fallback() external payable { revert("Function not found"); } 
//   receive() external payable { }
}