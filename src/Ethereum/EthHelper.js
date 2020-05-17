import BigNumber from 'bignumber.js';
import { 
  factoryContract, 
  initalizeERC20Channel, 
  initalizeEthChannel, 
  web3
} from './ContractInstances';
import moment from 'moment';
import { assetData } from './AssetData';
const sigUtil = require('eth-sig-util');


export const addressShortener = (address) => {
  if(address !== undefined) {
    const shortAddress = `${address.slice(0, 6)}...${address.slice(37, 42)}`;
    return shortAddress;
  }
}

export const signatureShortener = (sig) => {
  const shortSig = `${sig.slice(0, 11)}...${sig.slice(124, 132)}`;
  return shortSig;
}

export const calculateEndTime = async (days, hours) => {
  BigNumber.config({ DECIMAL_PLACES: 0 })
  const currentTime = Date.now();
  const currentTimeBN = new BigNumber(currentTime);
  const dayBN = new BigNumber(days);
  const hourBN = new BigNumber(hours);

  const currentUnixTimeBN = currentTimeBN.div(1000);
  const daysInSec = await dayBN.times(24).times(60).times(60);
  const hoursInSec = await hourBN.times(60).times(60);
  const additionalTime = daysInSec.plus(hoursInSec);
  const endTime = await currentUnixTimeBN.plus(additionalTime);
  return endTime;
}

export const formatUnixTime = async (endTime) => {
  const m = await moment.unix(endTime).toString();
  const formattedTime = `${m.slice(0, (m.length-12))} UTC`
  return formattedTime;
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
  let channelContract;
  let recipient;
  let sender;
  let balance;
  let assetDetails;
  let channelNonce;
  let endTime;

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

    try{
      channelContract = await initalizeERC20Channel(channelAddress);
      const cTokenAddress = await channelContract.methods.token().call();
      recipient = await channelContract.methods.recipient().call();
      sender = await channelContract.methods.sender().call();
      balance = await channelContract.methods.underlyingBalance().call();
      channelNonce = await channelContract.methods.channelNonce().call();
      endTime = await channelContract.methods.endTime().call();
      assetDetails = await assetData.find(token => token.tokenAddress === cTokenAddress);
    }
    catch {
      channelContract = await initalizeEthChannel(channelAddress);
      const cTokenAddress = await channelContract.methods.cEther().call();
      recipient = await channelContract.methods.recipient().call();
      sender = await channelContract.methods.sender().call();
      balance = await channelContract.methods.underlyingBalance().call();
      channelNonce = await channelContract.methods.channelNonce().call();
      endTime = await channelContract.methods.endTime().call();
      assetDetails = await assetData.find(asset => asset.cTokenAddress === cTokenAddress);
    }
    
    channelDetails = {...assetDetails};
    channelDetails.recipient = recipient;
    channelDetails.sender = sender;
    channelDetails.formattedEndTime = await formatUnixTime(endTime);
    channelDetails.channelNonce = channelNonce;
    channelDetails.channelAddress = channelContract.options.address;
    channelDetails.formattedBalance = await formatDisplayAmount(balance, assetDetails.decimals);
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
  {name: "amount", type: "uint256"},
  {name: "nonce", type: "uint8"}
];

export const signData = async (
  userAddress, 
  amount, 
  channelAddress, 
  setSignature, 
  nextStep,
  channelNonce
  ) => {
  
  const domainData = {
    name: "Compound Channels",
    version: "1",
    chainId: 42,
    verifyingContract: channelAddress,
    salt: "0xf2e421f4a3edcb9b1111d503bfe733db1e3f6cdc2b7971ee739626c97e86a558"
  };
  const message = {
    amount: amount,
    nonce: channelNonce
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
  channelNonce, 
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
    amount: amount,
    nonce: channelNonce
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


