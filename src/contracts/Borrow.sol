pragma solidity 0.6.6;

interface ERC20 {
  function approve(address, uint256) external returns (bool);
  function transferFrom(address, address, uint256) external returns (bool);
  function transfer(address, uint256) external returns (bool);
}

interface CERC20 {
  function mint(uint256) external returns (uint256);
  function borrow(uint256) external returns (uint256);
  // function borrowRatePerBlock() external view returns (uint256);
  function borrowBalanceCurrent(address) external returns (uint256);
  function repayBorrow(uint256) external returns (uint256);
  function transfer(address, uint256) external returns (bool);
  function approve(address, uint256) external returns (bool);
}

interface CEth {
  function mint() external payable;
  function borrow(uint256) external returns (uint256);
  function repayBorrow() external payable;
  function borrowBalanceCurrent(address) external returns (uint256);
}

interface Comptroller {
  function markets(address) external returns (bool, uint256);

  function enterMarkets(address[] calldata)
  external
  returns (uint256[] memory);

  function getAccountLiquidity(address)
  external
  view
  returns (uint256, uint256, uint256);
}

contract BorrowProxy {
  ERC20 public token;
  CERC20 cToken;
  address sender;

  constructor(
    address _tokenAddress,
    address _cTokenAddress
    ) public {
    token = ERC20(_tokenAddress);
    cToken = CERC20(_cTokenAddress);
  }

  function borrowAsset(
    uint256 _amount,
    address _tokenGive,
    address _cTokenGive,
    address _compTrollAddress
    ) public returns (bool) {
    // Makes sure that the token for the channel being used is not allowed as collateral
    require(address(token) != _tokenGive);
    // Asset user is giving
    ERC20 tokenGive = ERC20(_tokenGive);
    CERC20 cTokenGive = CERC20(_cTokenGive);

    Comptroller comptroller = Comptroller(_compTrollAddress);
    // Move allowance to channel
    tokenGive.transferFrom(msg.sender, address(this), _amount);

    // Supply Colateral for borrow
    require(tokenGive.approve(_cTokenGive, _amount), 'approval error');
    require(cTokenGive.mint(_amount) == 0, 'minting error');

    // Enter the market
    address[] memory cTokens = new address[](1);
    cTokens[0] = _cTokenGive;
    uint256[] memory errors = comptroller.enterMarkets(cTokens);
    if (errors[0] != 0) {
        revert("Comptroller.enterMarkets failed.");
    }

    // FIXME: figure out the proper ratio for the amount that someone can borrow, wrong amount;
    cToken.borrow(_amount);
    uint256 borrowedAmount = cToken.borrowBalanceCurrent(address(this));
    // Takes borrow amount and converts back to cToken
    token.approve(address(address(cToken)), borrowedAmount);
    require(cToken.mint(borrowedAmount) == 0, 'minting error');
  }

  function repayDebt(
    address _tokenGot, // asset the user got from borrowing
    address _cTokenGot,
    uint256 _amount
    ) public {
    // Contract Instances
    ERC20 tokenGot = ERC20(_tokenGot);
    CERC20 cTokenGot = CERC20(_cTokenGot);

    // Move tokens to contract
    tokenGot.transferFrom(msg.sender, address(this), _amount);

    tokenGot.approve(address(cTokenGot), _amount);
    require(cTokenGot.repayBorrow(_amount) == 0, 'repay error');
  }

  function withdrawLoanedFunds(address _cTokenGet, uint256 _amount) public returns (bool) {
    require(msg.sender == sender, 'incorret address'); // makes sure that only the sender can remove funds
    require(address(cToken) != _cTokenGet); // make sure they can't touch the channel's cTokens
    CERC20 cTokenGet = CERC20(_cTokenGet);
    cTokenGet.transfer(sender, _amount);
  }
}