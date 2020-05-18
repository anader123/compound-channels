import React, { useState, useEffect } from 'react';

// Components
import LoadingChannels from './Units/LoadChannels';
import ConfirmationBox from './Units/ConfirmationBox';
import InputBox from './Units/InputBox';
import LoadingScreen from './Units/LoadingScreen';
import TransactionBox from './Units/TransactionBox';

// Ethereum
import { 
  // formatBeforeSend, 
  addressShortener, 
  loadChannels, 
  calculateRepayAmount,
  getERC20Balance,
  getETHBalance
} from '../Ethereum/EthHelper';
import { repayAsset, withdrawLoaned } from '../Ethereum/ChannelContractFunctions';
import { assetData } from '../Ethereum/AssetData';

import {
  Flex,
  Button,
  // Card,
  // Heading,
  // Image,
  // Text
} from 'rebass';
// import { tallCardBoxFormatting } from '../theme';

export default function Repay(props) {
  const { setStepDash } = props;

  const [ step, setStep ] = useState(1);
  const [ channels, setChannels ] = useState([]);
  const [ channelDetails, setChannelDetails ] = useState({channelAddress: '0x0000000000000000000000000000000000000000', recipient: '0x0000000000000000000000000000000000000000'});
  const [ txHash, setTxHash ] = useState('');
  const [ formattedRepayAmount, setFormattedRepayAmount ] = useState(5);
  const [ repayAmountDecimals, setRepayAmountDecimals] = useState(5);
  const [ channelLoaded, setChannelLoaded ] = useState(false);
  const [ withdrawAssetDetails, setWithdrawAssetDetails ] = useState();
  const [ formattedUserBalance, setFormattedUserBalance ] = useState(0);

  const repayDetails = [
    `Channel Address: ${addressShortener(channelDetails.channelAddress)}`,
    `Recipient Address: ${addressShortener(channelDetails.recipient)}`,
    `Your Balance: ${formattedUserBalance} ${channelDetails.symbol}`,
    `Owed Amount: ${formattedRepayAmount} ${channelDetails.symbol}`
  ];

  const withdrawDetails = [
    `Channel Address: ${addressShortener(channelDetails.channelAddress)}`,
    `Send to Address: ${addressShortener(channelDetails.sender)}`,
  ]

  const getChannels = async () => {
    const userAddress = window.ethereum.selectedAddress;
    const returnChannels = await loadChannels(userAddress, 'sender');
    setChannels(returnChannels);
    setChannelLoaded(true);
  }

  useEffect(() => {
    if(channels.length === 0) {
      getChannels();
    }
  },[channels.length])

  const nextStep = () => {
    const newStep = step + 1;
    setStep(newStep)
  }

  const nextStepCalc = async (channel) => {
    let formattedBalance;
    const {channelAddress, cTokenAddress, decimals, tokenAddress, symbol} = channel;
    const userAddress = window.ethereum.selectedAddress;
    const {repayAmountDecimals, formattedRepayAmount} = await calculateRepayAmount(channelAddress, cTokenAddress, decimals);
    if(symbol === 'ETH'){
      formattedBalance = await getETHBalance(userAddress);
      formattedBalance = parseFloat(formattedBalance).toFixed(3);
    }
    else {
      formattedBalance = await getERC20Balance(userAddress, tokenAddress, decimals);
      formattedBalance = parseFloat(formattedBalance).toFixed(3);
    }
    await setFormattedUserBalance(formattedBalance);
    await setRepayAmountDecimals(repayAmountDecimals);
    await setFormattedRepayAmount(formattedRepayAmount);
    nextStep();
  }

  const previousStep = () => {
    const newStep = step - 1;
    setStep(newStep)
  }

  const updateChannel = (channel) => {
    setChannelDetails(channel);
    nextStepCalc(channel);
  }

  const setToken = (symbol) => {
    const tokenDetails = assetData.find(token => token.symbol === symbol);
    setWithdrawAssetDetails(tokenDetails);
  }

  const repayAssetChannel = async () => {
    const channelAddress = channelDetails.channelAddress;
    const sender = window.ethereum.selectedAddress;
    const symbol = channelDetails.symbol;
    const tokenAddress = channelDetails.tokenAddress;

    if(+formattedRepayAmount > +formattedUserBalance) {
      (window.alert("You don't have enough to repay the debt in total"));
      return;
    }

    try{
      repayAsset(
        channelAddress,
        sender,
        repayAmountDecimals,
        symbol,
        tokenAddress,
        step,
        setStep,
        setTxHash
      );
    }
    catch(error) {
      console.log(error);
    }
  }

  const withdrawLoanedAssets = async () => {
    const channelAddress = channelDetails.channelAddress;
    const sender = window.ethereum.selectedAddress;
    const channelSymbol = channelDetails.symbol;
    const withdrawSymbol = withdrawAssetDetails.symbol;
    const tokenAddress = withdrawAssetDetails.tokenAddress;
    const cTokenAddress = withdrawAssetDetails.cTokenAddress;

    withdrawLoaned(
      channelAddress,
      sender,
      channelSymbol,
      withdrawSymbol,
      tokenAddress,
      cTokenAddress,
      step,
      setStep,
      setTxHash
    );

  }

  switch(step) {
    case 1: 
      return (
        <LoadingChannels 
        setStepDash={setStepDash} 
        updateChannel={updateChannel} 
        channels={channels} 
        previousStep={previousStep} 
        channelLoaded={channelLoaded}
        addressType={'sender address'}
        />
      )
    case 2:
      return (
        <ConfirmationBox 
        image={{bool:true, src:channelDetails.image}}
        confirmButton={true}
        confirmHeading={'Confirm Repay Amount'} 
        confirmDetails={repayDetails} 
        previousStep={previousStep} 
        confirmFunction={repayAssetChannel} 
        />
      )
    case 3:
      return (
        <LoadingScreen />
      )
    case 4:
      return (
        <Flex flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
        <InputBox
          label={"Withdraw Loaned Assets"} 
          inputs={[]} 
          setToken={setToken} 
          textInfo={withdrawDetails}
          dropDown={true} />
          <Button onClick={withdrawLoanedAssets}>Withdraw</Button>
      </Flex>
      )
    case 5:
      return (
        <LoadingScreen />
      )
    case 6:
      return (
        <TransactionBox setStepDash={setStepDash} channelAddress={channelDetails.channelAddress} txHash={txHash}/>
      )
    default:
      return step;
  }
}
