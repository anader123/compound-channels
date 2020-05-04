pragma solidity 0.6.6;

import "@openzeppelin/contracts/cryptography/ECDSA.sol";

contract TestSign {
  using ECDSA for bytes32;
  address public result;
  // Signature Information
  uint256 constant chainId = 42; //Kovan
  address constant verifyingContract = 0xa771B67bF544ACe95431A52BA89Fbf55b861bA83;
  bytes32 constant salt = 0xf2e421f4a3edcb9b1111d503bfe733db1e3f6cdc2b7971ee739626c97e86a558;

  string private constant EIP712_DOMAIN = "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)";
  string private constant PAYMENT_TYPE = "Payment(uint256 amount)";

  bytes32 private constant EIP712_DOMAIN_TYPEHASH = keccak256(abi.encodePacked(EIP712_DOMAIN));
  bytes32 private constant PAYMENT_TYPEHASH = keccak256(abi.encodePacked(PAYMENT_TYPE));

  bytes32 private constant DOMAIN_SEPARATOR = keccak256(abi.encode(
    EIP712_DOMAIN_TYPEHASH,
    keccak256("Compound Channels"), // name
    keccak256("1"), // version
    chainId,
    verifyingContract,
    salt
  ));

  struct Payment {
    uint256 amount;
  }

  function hashPayment(Payment memory payment) private pure returns (bytes32) {
    return keccak256(abi.encodePacked(
      "\x19\x01",
      DOMAIN_SEPARATOR,
      keccak256(abi.encode(
        PAYMENT_TYPEHASH,
        payment.amount
      ))
    ));
  }

  function checkSignature(
    uint256 _amount,
    bytes memory _signature
    ) public {
      Payment memory payment = Payment({
        amount: _amount
      });

      bytes32 hash = hashPayment(payment);
      result = hash.recover(_signature);
  }
}