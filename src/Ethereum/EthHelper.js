import BigNumber from 'bignumber.js';
import { factoryContract, initalizeChannelContract, initalizeERC20, web3 } from './ContractInstances';
import { assetData } from './AssetData';
const sigUtil = require('eth-sig-util');


export const addressShortener = (address) => {
  const shortAddress = `${address.slice(0, 5)}...${address.slice(38, 42)}`;
  return shortAddress;
}

// Formats data from the blockchain
export const formatDisplayAmount = async (value, decimals) => {
  const bn = new BigNumber(value);
  const number = bn.shiftedBy(-decimals).toString(10);
  return number
};

// Formats data for transactions that are about to be sent
export const formatBeforeSend = async (value, decimals) => {
  const bn = new BigNumber(value);
  return bn.shiftedBy(decimals).toString(10);
};

export const loadChannels = async (userAddress, registeryName) => {
  let channels = [];
  let loopNum;
  let channelDetails = {};
  let channelAddress;

  if(registeryName === 'sender') {
    loopNum = await factoryContract.methods.senderCount(userAddress).call();
  }
  else {
    loopNum = await factoryContract.methods.recipientCount(userAddress).call();
  }

  for(let i = 0; i < loopNum; i++) {
    if(registeryName === 'sender') {
      channelAddress = await factoryContract.methods.senderRegistery(userAddress, i).call();
    }
    else {
      channelAddress = await factoryContract.methods.recipientRegistery(userAddress, i).call();
    }

    const channelContract = await initalizeChannelContract(channelAddress);
    const recipient = await channelContract.methods.recipient().call();
    const assetAddresss = await channelContract.methods.token().call();
    const sender = await channelContract.methods.sender().call();
    const balance = await channelContract.methods.underlyingBalance().call();
    const tokenDetails = await assetData.find(token => token.tokenAddress === assetAddresss);
    channelDetails = {... tokenDetails};

    channelDetails.recipient = recipient;
    channelDetails.sender = sender;
    channelDetails.balance = balance;
    channelDetails.channelAddress = channelContract.options.address;
    channelDetails.formattedBalance = await formatDisplayAmount(balance, tokenDetails.decimals);
    channels.push(channelDetails);
  }
  return channels;
};

// Signature Info
const domain = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" },
  { name: "salt", type: "bytes32" }
];

const Payment = [
  {name: "amount", type: "uint256"}
];

export const signData = async (
  userAddress, 
  amount, 
  channelAddress, 
  setSignature, 
  nextStep
  ) => {
  // const channelAddress = '0xa771B67bF544ACe95431A52BA89Fbf55b861bA83';
  // const signer = '0xe90b5c01BCD67Ebd0d44372CdA0FD69AfB8c0243';
  
  const domainData = {
    name: "Compound Channels",
    version: "1",
    chainId: 42,
    verifyingContract: channelAddress,
    salt: "0xf2e421f4a3edcb9b1111d503bfe733db1e3f6cdc2b7971ee739626c97e86a558"
  };
  const message = {
    // amount: '100000000000000000'
    amount: amount
  };
  
  const data = JSON.stringify({
    types: {
      EIP712Domain: domain,
      Payment: Payment
    },
    domain: domainData,
    primaryType: "Payment",
    message: message
  });

  const formattedSigner = web3.utils.toChecksumAddress(userAddress);
  web3.currentProvider.sendAsync(
    {
      method: "eth_signTypedData_v3",
      params: [formattedSigner, data],
      from: formattedSigner
    },
    function(err, result) {
      if (err) {
        return console.error(err);
      }
      const sig = result.result;
      setSignature(sig);
      nextStep();
    }
  );
}

export const verifySignature = async (
  senderAddress, 
  amount, 
  channelAddress,
  sig
  ) => {

  const domainData = {
    name: "Compound Channels",
    version: "1",
    chainId: 42,
    verifyingContract: channelAddress,
    salt: "0xf2e421f4a3edcb9b1111d503bfe733db1e3f6cdc2b7971ee739626c97e86a558"
  };
  
  const message = {
    amount: amount
  };
  
  const data = JSON.stringify({
    types: {
      EIP712Domain: domain,
      Payment: Payment
    },
    domain: domainData,
    primaryType: "Payment",
    message: message
  });

  const recovered = sigUtil.recoverTypedSignature({ data: JSON.parse(data), sig: sig });
  const formattedRecovered = web3.utils.toChecksumAddress(recovered);
  const formattedSender = web3.utils.toChecksumAddress(senderAddress);

  return formattedRecovered === formattedSender;
}