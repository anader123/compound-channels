import React, { useState, useEffect } from 'react';

// Components
import LoadingChannels from './Units/LoadChannels';
import ConfirmationBox from './Units/ConfirmationBox';
import InputBox from './Units/InputBox';
import LoadingScreen from './Units/LoadingScreen';
import TransactionBox from './Units/TransactionBox';

// Ethereum
import { 
  formatBeforeSend, 
  addressShortener, 
  loadChannels, 
  calculateMaxBorrow 
} from '../Ethereum/EthHelper';
import { borrowAsset } from '../Ethereum/ChannelContractFunctions';

import { assetData } from '../Ethereum/AssetData';

import {
  Flex,
  Button
} from 'rebass';

export default function Borrow(props) {
  const { setStepDash } = props;

  const [ step, setStep ] = useState(1);
  const [ channels, setChannels ] = useState([]);
  const [ channelDetails, setChannelDetails ] = useState(assetData[0]);
  const [ txHash, setTxHash ] = useState('');
  const [ giveAssetDetails, setGiveAssetDetails ] = useState(assetData[0]);
  const [ borrowAmount, setBorrowAmount ] = useState('');
  const [ giveAmount, setGiveAmount ] = useState('');
  const [ channelLoaded, setChannelLoaded ] = useState(false);
  const [ maxBorrow, setMaxBorrow ] = useState(0);

  useEffect(() => {
    if(channels.length === 0) {
      getChannels();
    }
  },[channels.length])
  
  const nextStep = () => {
    const newStep = step + 1;
    setStep(newStep)
  }

  const compareAndNextStep = () => {
   
    if(maxBorrow > (borrowAmount * 1.25)) {
      const newStep = step + 1;
      setStep(newStep);
    }
    else{
      window.alert('Please enter a smaller Borrow Amount')
    }
  }

  const previousStep = () => {
    const newStep = step - 1;
    setStep(newStep)
  }
  
  const getChannels = async () => {
    const userAddress = window.ethereum.selectedAddress;
    const returnChannels = await loadChannels(userAddress, 'sender');
    setChannels(returnChannels);
    setChannelLoaded(true);
  }

  const borrowChannelAsset = async () => {
    const sender = window.ethereum.selectedAddress;
    const tokenAddress = channelDetails.tokenAddress;
    const channelAddress = channelDetails.channelAddress;
    const giveDecimals = giveAssetDetails.decimals;
    const borrowDecimals = channelDetails.decimals;
    const decimalGiveAmount = await formatBeforeSend(giveAmount, giveDecimals);
    const decimalBorrowAmount = await formatBeforeSend(borrowAmount, borrowDecimals);
    const borrowAssetSymbol = channelDetails.symbol;
    const giveAssetSymbol = giveAssetDetails.symbol;
    const giveTokenAddress = giveAssetDetails.tokenAddress;
    const giveTokenCTokenAddress = giveAssetDetails.cTokenAddress;

    try{
      borrowAsset(
        sender,
        tokenAddress,
        channelAddress,
        decimalGiveAmount,
        decimalBorrowAmount,
        borrowAssetSymbol,
        giveAssetSymbol,
        giveTokenAddress,
        giveTokenCTokenAddress,
        step,
        setStep,
        setTxHash
      );
    }
    catch(error) {
      console.log(error);
    }
  }

  const updateChannel = (channel) => {
    setChannelDetails(channel);
    nextStep();
  }

  const setGiveAsset = (symbol) => {
    const assetDetails = assetData.find(asset => asset.symbol === symbol);
    setGiveAssetDetails(assetDetails);
  }

  const calculateMaxBorrowChannel = async (value) => {
    const supplyCTokenAddress = giveAssetDetails.cTokenAddress;
    const supplySymbol = giveAssetDetails.symbol;
    const borrowCTokenAddress = channelDetails.cTokenAddress;
    const borrowSymbol = channelDetails.symbol;
    const maxBorrow = await calculateMaxBorrow(
      value, 
      supplyCTokenAddress, 
      borrowCTokenAddress,
      supplySymbol,
      borrowSymbol
      );
    setMaxBorrow(maxBorrow);
    setGiveAmount(value)
  }

  const inputs = [
    {
      label: `Supply Amount (${giveAssetDetails.symbol})`,
      value: giveAmount,
      type: "number",
      fx: calculateMaxBorrowChannel
    },
    {
      label: `Borrow Amount (${channelDetails.symbol})`,
      value: borrowAmount,
      type: "number",
      fx: setBorrowAmount
    }
  ]

  const confirmDetails = [
    `Channel Address: ${addressShortener(channelDetails.channelAddress)}`,
    `Recipient Address: ${addressShortener(channelDetails.recipient)}`,
    `Give Amount: ${giveAmount} ${giveAssetDetails.symbol}`,
    `Borrow Amount: ${borrowAmount} ${channelDetails.symbol}`
  ]

  const textInfo = [
    `Channel: ${addressShortener(channelDetails.channelAddress)}`,
    `Channel Balance: ${channelDetails.formattedBalance} ${channelDetails.symbol}`,
    `Max Borrow: ${maxBorrow} ${channelDetails.symbol}`
  ]
  
  switch(step) {
    case 1: 
      return (
        <LoadingChannels 
        setStepDash={setStepDash} 
        updateChannel={updateChannel} 
        channels={channels} 
        previousStep={previousStep} 
        nextStep={nextStep} 
        channelLoaded={channelLoaded}
        addressType={'sender address'}
        />
      )
    case 2:
      return (
        <Flex flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
          <InputBox 
            text={true} 
            setToken={setGiveAsset} 
            dropDown={true} 
            label={'Enter Borrow Info'} 
            inputs={inputs} 
            textInfo={textInfo} 
          />
          <Flex>
            <Button onClick={previousStep}>Back</Button>
            <Button onClick={compareAndNextStep}>Next</Button>
          </Flex>
        </Flex>
      )
    case 3:
      return (
        <ConfirmationBox 
        image={{bool:false}}
        confirmButton={true}
        confirmHeading={'Confirm your Transaction'} 
        confirmDetails={confirmDetails} 
        previousStep={previousStep} 
        confirmFunction={borrowChannelAsset} 
        />
      )
    case 4:
      return (
        <LoadingScreen />
      )
    case 5:
      return (
        <TransactionBox setStepDash={setStepDash} channelAddress={channelDetails.channelAddress} txHash={txHash}/>
      )
    default:
      return step;
  }
}
