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

