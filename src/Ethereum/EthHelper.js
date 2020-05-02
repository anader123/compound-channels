import BigNumber from 'bignumber.js';
import { facotryContract, initalizeChannelContract } from './ContractInstances';
import { assetData } from './AssetData';


export const addressShortener = (address) => {
  const shortAddress = `${address.slice(0, 7)}...${address.slice(37, 42)}`;
  return shortAddress;
}

// Formats data from the blockchain
export const formatDisplayAmount = async (value, ERC20Contract) => {
  const decimals = await ERC20Contract.methods.decimals().call()
  const bn = new BigNumber(value);
  
  return bn.shiftedBy(-decimals).toString(10);
};

// Formats data for transactions that are about to be sent
export const formatBeforeSend = async (value, ERC20Contract) => {
  const decimals = await ERC20Contract.methods.decimals().call()
  const bn = new BigNumber(value);
  
  return bn.shiftedBy(decimals).toString(10);
};

export const loadChannels = async (userAddress) => {
  let channels = [];

  for(let i = 0; i < 5; i++) {
  const channelAddress = facotryContract.methods.channelRegistery(userAddress, i).call();
  
  // Makes sure that there is a channel registered
  if(channelAddress !== '0x0000000000000000000000000000000000000000') {
    let channelDetails;

    const channelContract = await initalizeChannelContract(channelAddress);
    const recipient = await channelContract.methods.recipient().call();
    const assetAddresss = await channelContract.methods.token().call();

    const index = assetData.map((token, index) => {
      if(token.tokenAddress === assetAddresss) {
        return index
      }
    });

    channelDetails = assetData[index];
    channelDetails.recipient = recipient;

    channels.push(channelDetails);
    }
  }
};

// TODO: make sure to take the 0x off the front of the sig from the user and then parse for v, s, r
export const signData = (web3, channelAddress) => {
  const signer = '0xBBfFb22245b7813b0897902725624e49402EF24D';

  const domain = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
    { name: "salt", type: "bytes32" },
  ];
  
  const Payment = [
    { name: "amount", type: "uint256"},
  ]
  
  const domainData = {
    name: "Compound Channels",
    version: "1",
    // Kovan
    chainId: "42",
    verifyingContract: channelAddress,
    salt: "0xf2e421f4a3edcb9b1111d503bfe733db1e3f6cdc2b7971ee739626c97e86a558"
  };
  
  const message = {
    amount: "10000"
  };
  
  const data = JSON.stringify({
    types: {
      EIP712Domain: domain,
      Payment
    },
    domain: domainData,
    primaryType: "Payment",
    message: message
  });

  web3.currentProvider.sendAsync(
    {
      method: "eth_signTypedData_v3",
      params: [signer, data],
      from: signer
    },
    function(err, result) {
      if (err) {
        return console.error(err);
      }
      const sig = result.result.substring(2);
      const r = "0x" + sig.substring(0, 64);
      const s = "0x" + sig.substring(64, 128);
      const v = parseInt(sig.substring(128, 130), 16);
      // The signature is now comprised of r, s, and v.
      const signature = "0x" + sig;
      console.log(signature);
    }
  );
}