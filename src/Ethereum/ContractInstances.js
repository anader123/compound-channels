import Web3 from 'web3';

// Contract ABI
import { ERC20Abi } from './AbiData';
import compoundChannelFactory from '../abis/CompoundChannelFactory.json';
import ERC20Channel from '../abis/Erc20Channel.json';
import EthChannel from '../abis/EthChannel.json';

// Contract Instances
export let web3;
export let factoryContract;
export let channelContract;
export let borrowContract;

// const factoryAddress = compoundChannelFactory.networks[999].address;
// console.log(factoryAddress)
const factoryAddress = '0x3f301ca75ebc84db14e006bbea25eb65652b7c7c'; // Kovan address 


// Creates Core contract instance
export const initializeWeb3 = () => {
  try {
    const provider =  window.web3.currentProvider;
    web3 = new Web3(provider);
    factoryContract = new web3.eth.Contract(compoundChannelFactory.abi, factoryAddress);
  }
  catch (err) {
    throw new Error(`No inject web3: ${err}`);
  }
}

export const initalizeERC20 = async (tokenAddress) => {
  let ERC20Contract = await new web3.eth.Contract(ERC20Abi, tokenAddress);
  return ERC20Contract;
}

export const initalizeEthChannel = async (channelAddress) => {
  channelContract = new web3.eth.Contract(EthChannel.abi, channelAddress);
  return channelContract;
}

export const initalizeERC20Channel = async (channelAddress) => {
  channelContract = new web3.eth.Contract(ERC20Channel.abi, channelAddress);
  return channelContract;
}