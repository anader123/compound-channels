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
  address public factoryAddress;
  bool initialized;

//   Events
    // Need to add events
  event FundsDeposited(address depositor, uint256 amount, address TokenAddress);
  // event ChannelForceClosed();
  // event ChannelClose();
  // event FundsBorrowed();
  
  function init(
    address payable _sender,
    address payable _recipient,
    uint256 _endTime,
    address _tokenAddress,
    address _cTokenAddress,
    address _factoryAddress
  ) public returns(bool) {
     // Makes sure the function can only be called once 
    require(initialized == false, 'already initialized');
    initialized = true;

    factoryAddress = _factoryAddress;
    sender = _sender;
    recipient = _recipient;
    endTime = _endTime;
    token = IERC20(_tokenAddress); // zero address if underlying is Ether 
    cToken = CERC20(_cTokenAddress);

    return true; 
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
    channelNonce += 1;
    
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
  fallback() external payable { }
//   fallback() external { revert("Function not found"); } 
//   receive() external payable { }
}