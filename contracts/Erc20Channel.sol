pragma solidity 0.6.6;

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
  function borrowBalanceCurrent(address) external returns (uint256);
  function repayBorrow(uint256) external returns (uint256);
}

interface CETH {
  function mint() external payable;
  function exchangeRateCurrent() external returns (uint256);
  function supplyRatePerBlock() external returns (uint256);
  function redeem(uint256) external returns (uint256);
  function redeemUnderlying(uint256) external returns (uint256);
  function balanceOf(address) external view returns (uint256);
  function borrow(uint256) external returns (uint256);
  function borrowBalanceCurrent(address) external returns (uint256);
  function repayBorrow() external payable;
}

interface Comptroller {
  function markets(address) external returns (bool, uint256);
  function enterMarkets(address[] calldata) external returns (uint256[] memory);
  function getAccountLiquidity(address) external view returns (uint256, uint256, uint256);
}

contract Erc20Channel {
  using SafeMath for uint256;

/* ============ State variables ============ */
  uint256 public underlyingBalance; // underlying asset balance
  address payable public sender;
  address payable public recipient;
  uint256 public endTime;
  uint8 public channelNonce;
  IERC20 public token;
  CERC20 public cToken;
  address public factoryAddress;
  bool initialized;

/* ============ Events ============ */
  event FundsDeposited(address depositor, uint256 amount, address tokenAddress);
  event ChannelForceClosed(uint256 senderAmount, uint256 closedTime);
  event ChannelClosed(uint256 senderAmount, uint256 recipientAmount, uint256 closedTime);
  event FundsBorrowedAgainstERC20(
    address tokenGive, 
    uint256 giveAmount, 
    address tokenBorrowed, 
    uint256 borrowAmount
  );
  event FundsBorrowedAgainstEth(
    uint256 giveAmount, 
    address tokenBorrowed, 
    uint256 borrowAmount
  );
  event BorrowedFundsRepaid(uint256 repayAmount, address tokenAddress);
  event LoanedERC20Withdrawn(address tokenAddress, uint256 withdrawAmount);
  event LoanedEthWithdrawn(uint256 withdrawAmount);
  event EndTimeExtended(uint256 newTime);

  /* ============ Public Functions ============ */
  /**
   * Initializes state variable and can only run once when the channel is created/cloned in place of constructor
   *
   * @param _sender               Address that will be depositing funds into the channel
   * @param _recipient            Address that will recieve some of the funds when channel is closed
   * @param _endTime              Time in unix when the channel can be forced closed
   * @param _tokenAddress         Address of the underlying token for the channel (ex: DAI Address)
   * @param _cTokenAddress        Address of the cToken for the channel (ex: cDAI Address)
   * @param _factoryAddress       The address of the factory that created the channel
   */
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

  /**
   * Used to deposit the underlying asset into the channel and converts it into cToken (ex: deposit DAI for a cDAI channel)
   *
   * @param _amount             The amount of underlying token to be added to the channel
   */
  function depositERC20(uint256 _amount) public returns(bool) {
    token.transferFrom(msg.sender, address(this), _amount);
    underlyingBalance = underlyingBalance.add(_amount); // update underlying asset balance
    require(token.approve(address(cToken), _amount), 'approval error');
    require(cToken.mint(_amount) == 0, 'minting error');

    emit FundsDeposited(msg.sender, _amount, address(token));
    return true;
  }

  /**
   * Emergency function that is to be called if the recipient doesn't call the close function before the specified endTime
   *
   */ 
  function forceClose() public {
    require(now > endTime, 'too early to close');
    require(msg.sender == sender, 'nonsender address');
    underlyingBalance = 0;
    channelNonce += 1;
    
    uint256 cTokenBalance = cToken.balanceOf(address(this));
    require(cToken.redeem(cTokenBalance) == 0, "redeem error");
    uint256 balance = token.balanceOf(address(this));
    token.transfer(sender, balance);
    emit ChannelForceClosed(balance, block.timestamp);
  }

  /**
   * Called by the recipient when they would like to recieve their payment
   *
   * @param _amount             The amount of underlying token that was signed to the recipient
   * @param _signature          Sig that was created to the recipient for a specific amount
   */
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
    if (toRecipient < balance) {
      uint256 toSender = balance.sub(toRecipient);
      token.transfer(sender, toSender);
      emit ChannelClosed(toSender, toRecipient, block.timestamp);
    }
    else {
      emit ChannelClosed(0, toRecipient, block.timestamp);
    }
  }

  /**
   * Allows someone to borrow the underlying ERC20 token of the channel from Compound against a different Compound ERC20 asset
   *
   * @param _tokenGive            ERC20 address that is provided to borrow against
   * @param _cTokenGive           cToken address of the token that is provided to borrow against
   * @param _giveAmount           The amount of the provided to token that they are willing to supply
   * @param _getAmount            How much of the underlying token they would like to receive
   */

  function borrowERC20AgainstERC20(
    address _tokenGive, 
    address _cTokenGive, 
    uint256 _giveAmount,
    uint256 _getAmount
    ) public {
    // Prevents from entering the market of the channel asset
    require(address(cToken) != _cTokenGive);

    // Contract Instances
    IERC20 tokenGive = IERC20(_tokenGive);
    CERC20 cTokenGive = CERC20(_cTokenGive);
    Comptroller comptroller = Comptroller(0x1f5D7F3CaAC149fE41b8bd62A3673FE6eC0AB73b); //Kovan comptroller address

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

    emit FundsBorrowedAgainstERC20(_tokenGive, _giveAmount, address(token), _getAmount);
  }

  /**
   * Allows someone to borrow the underlying ERC20 token of the channel from Compound against Ether
   *
   * @param _cEth                 cEther address
   * @param _getAmount            How much of the underlying token they would like to receive
   */
  function borrowERC20AgainstETH(
    address _cEth, 
    uint256 _getAmount
    ) public payable {
    require(address(cToken) != _cEth);

    // Contract Instances
    CETH cEthGive = CETH(_cEth);
    Comptroller comptroller = Comptroller(0x1f5D7F3CaAC149fE41b8bd62A3673FE6eC0AB73b); //Kovan comptroller address 
    
    // Supply Colateral for borrow
    cEthGive.mint{gas: 250000, value: msg.value}(); //0.6.0 syntax

    // Enter the market
    address[] memory cTokens = new address[](1);
    cTokens[0] = _cEth;
    uint256[] memory errors = comptroller.enterMarkets(cTokens);
    if (errors[0] != 0) {
      revert("Comptroller.enterMarkets failed.");
    }
    cToken.borrow(_getAmount);
    underlyingBalance = underlyingBalance.add(_getAmount); // update underlying asset balance
    // Takes borrow amount and converts back to cToken
    token.approve(address(cToken), _getAmount);
    require(cToken.mint(_getAmount) == 0, 'minting error');

    emit FundsBorrowedAgainstEth(msg.value, address(token), _getAmount);
  }

  /**
   * Repays the borrowed underlying asset of the channel if an allowance has been set for the channel contract
   *
   */ 
  function repayERC20Borrowed() public {
    uint256 allowance = token.allowance(msg.sender, address(this));
    uint256 repayAmount = cToken.borrowBalanceCurrent(address(this));

    if (allowance > repayAmount) {
      token.transferFrom(msg.sender, address(this), repayAmount);
      token.approve(address(cToken), repayAmount);
      require(cToken.repayBorrow(repayAmount) == 0, 'repay error');
      emit BorrowedFundsRepaid(repayAmount, address(token));
    }

    else {
      token.transferFrom(msg.sender, address(this), allowance);
      token.approve(address(cToken), allowance);
      require(cToken.repayBorrow(allowance) == 0, 'repay error');
      emit BorrowedFundsRepaid(allowance, address(token));
    }
  }

  /**
   * Withdraws the ERC20 that was used to borrow against once the debt has been repaid
   *
   * @param _tokenGave            ERC20 token address of the token that was supplied
   * @param _cTokenGave           cToken address of the token that was supplied
   */
  function withdrawLoanedERC20(address _tokenGave, address _cTokenGave) public {
    require(_tokenGave != address(token));
    require(_cTokenGave != address(cToken));
    require(sender == msg.sender);

    uint256 repayAmount = cToken.borrowBalanceCurrent(address(this));
    require(repayAmount == 0, 'need to repay debt');

    CERC20 cTokenGave = CERC20(_cTokenGave);
    IERC20 tokenGave = IERC20(_tokenGave);
    
    uint256 cTokenBalance = cTokenGave.balanceOf(address(this));
    require(cTokenGave.redeem(cTokenBalance) == 0, 'redeem error');
    uint256 tokenBalance = tokenGave.balanceOf(address(this));
    tokenGave.transfer(sender, tokenBalance);
    emit LoanedERC20Withdrawn(_tokenGave, tokenBalance);
  }

  /**
   * Withdraws the Ether that was used to borrow against once the debt has been repaid
   *
   * @param _cEth           cToken address of the token that was supplied
   */
  function withdrawLoanedEth(address _cEth) public {
    require(_cEth != address(cToken));
    require(sender == msg.sender);
    
    uint256 repayAmount = cToken.borrowBalanceCurrent(address(this));
    require(repayAmount == 0, 'need to repay debt');

    CETH cEther = CETH(_cEth);
    uint256 cEthBalance = cEther.balanceOf(address(this));
    require(cEther.redeem(cEthBalance) == 0, 'redeem error');
    sender.transfer(address(this).balance);
    emit LoanedEthWithdrawn(address(this).balance);
  }

  /**
   * Extends the end time of the channel to a further date if proposed by the sender and the new time is greater than the currenct end time
   *
   * @param _newTime         Proposed new end time
   */
  function extendEndTime(uint256 _newTime) public {
    require(msg.sender == sender, 'nonsender address');
    require(_newTime > endTime, 'newTime needs to be > endTime');
    
    endTime = _newTime;
    emit EndTimeExtended(_newTime);
  }
  
  fallback() external payable { }
//   fallback() external { revert("Function not found"); } 
//   receive() external payable { }
}