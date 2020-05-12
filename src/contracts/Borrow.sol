// pragma solidity 0.6.6;

// interface ERC20 {
//   function approve(address, uint256) external returns (bool);
//   function transferFrom(address, address, uint256) external returns (bool);
//   function transfer(address, uint256) external returns (bool);
// }

// interface CERC20 {
//   function mint(uint256) external returns (uint256);
//   function borrow(uint256) external returns (uint256);
//   // function borrowRatePerBlock() external view returns (uint256);
//   function borrowBalanceCurrent(address) external returns (uint256);
//   function repayBorrow(uint256) external returns (uint256);
//   function transfer(address, uint256) external returns (bool);
//   function approve(address, uint256) external returns (bool);
// }

// interface CEth {
//   function mint() external payable;
//   function borrow(uint256) external returns (uint256);
//   function repayBorrow() external payable;
//   function borrowBalanceCurrent(address) external returns (uint256);
//   function balanceOf(address) external view returns (uint256);
//   function borrow(uint256) external returns (uint256);
// }

// interface Comptroller {
//   function markets(address) external returns (bool, uint256);
//   function enterMarkets(address[] calldata) external returns (uint256[] memory);
//   function getAccountLiquidity(address) external view returns (uint256, uint256, uint256);
// }

// contract BorrowProxy {
//   ERC20 public token;
//   CERC20 cToken;
//   address sender;

//   constructor(
//     address _tokenAddress,
//     address _cTokenAddress
//     ) public {
//     token = ERC20(_tokenAddress);
//     cToken = CERC20(_cTokenAddress);
//   }

//   function borrowAsset(
//     uint256 _amount,
//     address _tokenGive,
//     address _cTokenGive,
//     address _compTrollAddress
//     ) public returns (bool) {
//     // Makes sure that the token for the channel being used is not allowed as collateral
//     require(address(token) != _tokenGive);
//     // Asset user is giving
//     ERC20 tokenGive = ERC20(_tokenGive);
//     CERC20 cTokenGive = CERC20(_cTokenGive);

//     Comptroller comptroller = Comptroller(_compTrollAddress);
//     // Move allowance to channel
//     tokenGive.transferFrom(msg.sender, address(this), _amount);

//     // Supply Colateral for borrow
//     require(tokenGive.approve(_cTokenGive, _amount), 'approval error');
//     require(cTokenGive.mint(_amount) == 0, 'minting error');

//     // Enter the market
//     address[] memory cTokens = new address[](1);
//     cTokens[0] = _cTokenGive;
//     uint256[] memory errors = comptroller.enterMarkets(cTokens);
//     if (errors[0] != 0) {
//       revert("Comptroller.enterMarkets failed.");
//     }

//     // FIXME: figure out the proper ratio for the amount that someone can borrow, wrong amount;
//     cToken.borrow(_amount);
//     uint256 borrowedAmount = cToken.borrowBalanceCurrent(address(this));
//     // Takes borrow amount and converts back to cToken
//     token.approve(address(address(cToken)), borrowedAmount);
//     require(cToken.mint(borrowedAmount) == 0, 'minting error');
//   }

//   function repayERC20Borrowed() public {
//     uint256 allowance = token.allowance(msg.sender, address(this));
//     uint256 repayAmount = cToken.borrowBalanceCurrent(address(this));

//     if(allowance > repayAmount) {
//       token.transfer(address(this), repayAmount);
//       cToken.repayBorrow(repayAmount);
//     }

//     else {
//       token.transfer(address(this), allowance);
//       cToken.repayBorrow(allowance);
//     }
//   }

//   function repayEthBorrowed() public {
//     uint received = msg.value;
//     uint256 repayAmount = cEther.borrowBalanceCurrent(address(this));

//     if(received > repayAmount) {
//       cEther.repayBorrow{value: repayAmount}();
//       msg.sender.transfer(received - repayAmount);
//     }
//     else {
//       cEther.repayBorrow{value: received}();
//     }
//   }

//   // function withdrawLoanedFunds(address _cTokenGet, uint256 _amount) public returns (bool) {
//   //   require(msg.sender == sender, 'incorret address'); // makes sure that only the sender can remove funds
//   //   require(address(cToken) != _cTokenGet); // make sure they can't touch the channel's cTokens
//   //   CERC20 cTokenGet = CERC20(_cTokenGet);
//   //   cTokenGet.transfer(sender, _amount);
//   // }

//   function withdrawLoanedEth(address _cEth) public {
//     uint256 repayAmount = cToken.borrowBalanceCurrent(address(this));
//     require(repayAmount = 0, 'need to repay debt');

//     CETH cEther = CETH(_cEth);
//     uint256 cEthBalance = cEther.balanceOf(address(this));
//     require(cEther.redeem(cEthBalance) == 0, 'redeem error');
//     sender.transfer(address(this).balance);
//   }

//   function withdrawLoanedERC20(address _cTokenGave, address _tokenGave) public {
//     uint256 repayAmount = cToken.borrowBalanceCurrent(address(this));
//     require(repayAmount = 0, 'need to repay debt');

//     CERC20 cTokenGave = CERC20(_cTokenGave);
//     ERC20 tokenGave = ERC20(_tokenGave);
//     uint256 cTokenBalance = cTokenGave.balanceOf(address(this));
//     require(cTokenGave.redeem(cTokenBalance) == 0, 'redeem error');
//     uint256 tokenBalance = tokenGave.balanceOf(address(this));
//     tokenGave.transfer(sender, tokenBalance);
//   }
// }