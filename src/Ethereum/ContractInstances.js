import Web3 from 'web3';

// Contract ABI
import { ERC20Abi, ComptrollerAbi, cTokenAbi, PriceOracleAbi } from './AbiData';
import compoundChannelFactory from '../abis/CompoundChannelFactory.json';
import ERC20Channel from '../abis/Erc20Channel.json';
import EthChannel from '../abis/EthChannel.json';

// Contract Instances
export let web3;
export let factoryContract;
export let channelContract;
export let borrowContract;
export let comptrollerContract;

export const priceOracleAddress = '0x6998ed7daf969ea0950e01071aceeee54cccbab5' //Kovan
export const comptrollerAddress = '0x1f5d7f3caac149fe41b8bd62a3673fe6ec0ab73b'; // Kovan
const factoryAddress = '0xC87a2Bc93dbFa4Fa0E0C34Bacfab09dF48F58403'; // Kovan
// export const priceOracleAddress = '0x6600A2079f724F9dA3eCe619aE400E1ef16fC284' //Ropsten
// export const comptrollerAddress = '0xe03718b458a2e912141cf3fc8dab648362ee7463'; // Ropsten 
// const factoryAddress = '0x3FD88e3A0Db2d7BB00636f2cBE44cbc035F6d214'; // Ropsten

// Creates Core contract instance
export const initializeWeb3 = () => {
  try {
    const provider =  window.web3.currentProvider;
    web3 = new Web3(provider);
    factoryContract = new web3.eth.Contract(compoundChannelFactory.abi, factoryAddress);
    comptrollerContract = new web3.eth.Contract(ComptrollerAbi, comptrollerAddress);
  }
  catch (err) {
    throw new Error(`No inject web3: ${err}`);
  }
}

export const initalizeERC20 = async (tokenAddress) => {
  try {
    let ERC20Contract = await new web3.eth.Contract(ERC20Abi, tokenAddress);
    return ERC20Contract;
  }
  catch (err) {
    console.log(err);
  }
}

export const initalizeCToken = async (cTokenAddress) => {
  try {
    let cTokenContract = await new web3.eth.Contract(cTokenAbi, cTokenAddress);
    return cTokenContract;
  }
  catch (err) {
    console.log(err);
  }
}

export const initalizeEthChannel = async (channelAddress) => {
  try {
    channelContract = new web3.eth.Contract(EthChannel.abi, channelAddress);
    return channelContract;
  }
  catch (err) {
    console.log(err);
  }
}

export const initalizeERC20Channel = async (channelAddress) => {
  try {
    channelContract = new web3.eth.Contract(ERC20Channel.abi, channelAddress);
    return channelContract;
  }
  catch (err) {
    console.log(err);
  }
}

export const initalizePriceOracle = async () => {
  try {
    let priceOracleContract = new web3.eth.Contract(PriceOracleAbi, priceOracleAddress);
    return priceOracleContract;
  }
  catch (err) {
    console.log(err);
  }
}