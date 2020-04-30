pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/cryptography/ECDSA.sol";

interface CompoundContractInterface {
  function mint(uint mintAmount) external returns (uint);
  function redeem(uint redeemTokens) external returns (uint);
  function balanceOf(address guy) external view returns (uint);
}

contract CompoundChannelFactory {
  using ECDSA for bytes32;
  // State Variables
  mapping(address => address[]) public channelRegistery;

  // Events
  event ChannelCreated(address channelAddress, address sender);

  function createChannel(
    address payable _recipient,
    uint256 _endTime,
    uint256 _depositAmount,
    address _tokenAddress,
    address _cTokenAddress
    ) public returns(bool) {
    // Kovan Dai Address
    // IERC20 token = IERC20(0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa);
    IERC20 token = IERC20(_tokenAddress);
    // Creates new Channel Contract
    CompoundChannel compChan = new CompoundChannel(msg.sender, _recipient, _endTime, _tokenAddress, _cTokenAddress);

    // Transfers funds from allowance to the new contract
    require(token.transferFrom(msg.sender, address(compChan), _depositAmount), 'transferFrom error');
    // Has the new contract mint cTokens
    // require(compChan.depositFunds(), 'depositFunds error');  //issue with revert

    // Record new channel information
    channelRegistery[msg.sender].push(address(compChan));
    emit ChannelCreated(address(compChan), msg.sender);
    return true;
  }

  function checkSignature(address _sender, bytes memory _signature, address _channelAddress, uint256 _value) public pure returns(bool) {
    bytes32 hash = keccak256(abi.encodePacked(_value, _channelAddress)).toEthSignedMessageHash();
    address signer = hash.recover(_signature);
    require(signer == _sender, 'invalid signature');
    return true;
  }

}