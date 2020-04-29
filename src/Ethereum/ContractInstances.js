import Web3 from 'web3';

// Contract ABI
import { ERC20Abi } from './AbiData';

// Contract Instances
export const web3 = {};
export const channelContract = {};
export const borrowContract = {};
export const ERC20Contract = {};

// Creates Core contract instance
export const initializeWeb3 = () => {
  try {
    const provider =  window.web3.currentProvider;
    web3 = new Web3(provider);
    channelContract = new web3.eth.Contract(coreContract.coreAbi, coreContract.coreAddress);
    borrowContract = new web3.eth.Contract(coreContract.coreAbi, coreContract.coreAddress);
  }
  catch (err) {
    throw new Error(`No inject web3: ${err}`);
  }
}

export const initalizeERC20 = (tokenAddress) => {
  ERC20Contract = new web3.eth.Contract(ERC20Abi, tokenAddress);
}