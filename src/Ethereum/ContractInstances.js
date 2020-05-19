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
export const comptrollerAddress = '0x1f5d7f3caac149fe41b8bd62a3673fe6ec0ab73b'; // Kovan address
const factoryAddress = '0xAc29bc122C1d2e7bf5C767f0013D8EeFf6149805'; //cloneFactory on Kovan 
export const ethChanModel = '0x5c465A28Fa81DF524B9aCbf0741d6a320c1Eb44E'; //EthChan model on Kovan
export const erc20ChanModel = '0xFC9A6dD8dd30217febedf9ab77D593E5Ca1874c7'; // ERC20Chan model on Kovan

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
    const priceOracleContract = new web3.eth.Contract(PriceOracleAbi, priceOracleAddress);
    return priceOracleContract;
  }
  catch (err) {
    console.log(err);
  }
}