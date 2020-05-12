// pragma solidity ^0.6.0;

// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/cryptography/ECDSA.sol";
// import "@openzeppelin/contracts/math/SafeMath.sol";
// import { EthChannel } from './EthChannel.sol';
// import { Erc20Channel } from './Erc20Channel.sol';

// contract CompoundChannelFactory {
//   using ECDSA for bytes32;
//   // State Variables
//   mapping(address => address[]) public senderRegistery;
//   mapping(address => address[]) public recipientRegistery;
//   mapping(address => uint8) public senderCount;
//   mapping(address => uint8) public recipientCount;

//   // Signature Information
//   uint256 constant chainId = 42; //Kovan
//   bytes32 constant salt = 0xf2e421f4a3edcb9b1111d503bfe733db1e3f6cdc2b7971ee739626c97e86a558;

//   string private constant EIP712_DOMAIN = "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)";
//   string private constant PAYMENT_TYPE = "Payment(uint256 amount,uint8 nonce)";

//   bytes32 private constant EIP712_DOMAIN_TYPEHASH = keccak256(abi.encodePacked(EIP712_DOMAIN));
//   bytes32 private constant PAYMENT_TYPEHASH = keccak256(abi.encodePacked(PAYMENT_TYPE));

//   struct Payment {
//     uint256 amount;
//     uint8 nonce;
//   }

//   // Events
//   event ChannelCreated(address channelAddress, address sender, address recipient);

//   function createErc20Channel(
//     address payable _recipient,
//     uint256 _endTime,
//     address _tokenAddress,
//     address _cTokenAddress
//     ) public returns(bool) {

//     // Creates new Channel Contract
//     Erc20Channel compChan = new Erc20Channel(
//       msg.sender,
//       _recipient,
//       _endTime,
//       _tokenAddress,
//       _cTokenAddress,
//       address(this) // Factory Address
//     );

//     // Record new channel information
//     senderRegistery[msg.sender].push(address(compChan));
//     recipientRegistery[_recipient].push(address(compChan));
//     senderCount[msg.sender] += 1;
//     recipientCount[_recipient] += 1;
//     emit ChannelCreated(address(compChan), msg.sender, _recipient);
//     return true;
//   }
  
//   function createEthChannel(
//     address payable _recipient,
//     uint256 _endTime,
//     address _cEthAddress
//     ) public returns(bool) {

//     // Creates new Channel Contract
//     EthChannel ethChan = new EthChannel(
//       msg.sender,
//       _recipient,
//       _endTime,
//       _cEthAddress,
//       address(this) // Factory Address
//     );

//     // Record new channel information
//     senderRegistery[msg.sender].push(address(ethChan));
//     recipientRegistery[_recipient].push(address(ethChan));
//     senderCount[msg.sender] += 1;
//     recipientCount[_recipient] += 1;
//     emit ChannelCreated(address(ethChan), msg.sender, _recipient);
//     return true;
//   }

//   function hashPayment(
//     Payment memory payment,
//     address _channelAddress
//     ) private pure returns (bytes32){

//     bytes32 DOMAIN_SEPARATOR = keccak256(abi.encode(
//     EIP712_DOMAIN_TYPEHASH,
//     keccak256("Compound Channels"),
//     keccak256("1"),
//     chainId,
//     _channelAddress, // address of the channel that the message is for
//     salt
//     ));

//     return keccak256(abi.encodePacked(
//       "\x19\x01",
//       DOMAIN_SEPARATOR,
//       keccak256(abi.encode(
//         PAYMENT_TYPEHASH,
//         payment.amount,
//         payment.nonce
//       ))
//     ));
//   }

//   function checkSignature(
//     address _sender,
//     address _channelAddress,
//     uint8 _channelNonce,
//     uint256 _amount,
//     bytes memory _signature
//     ) public pure returns (bool) {
//       Payment memory payment = Payment({
//         amount: _amount,
//         nonce: _channelNonce
//       });

//       bytes32 hash = hashPayment(payment, _channelAddress);
//       return _sender == hash.recover(_signature);
//   }
// }