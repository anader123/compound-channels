import React, { useState, useEffect } from 'react';

// Components
import LoadingChannels from './Units/LoadChannels';
import ConfirmationBox from './Units/ConfirmationBox';
import InputBox from './Units/InputBox';
import LoadingScreen from './Units/LoadingScreen';
import TransactionBox from './Units/TransactionBox';

// Ethereum
import { formatBeforeSend, addressShortener, loadChannels } from '../Ethereum/EthHelper';
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
  const [ channelDetails, setChannelDetails ] = useState({channelAddress: '0x0000000000000000000000000000000000000000', recipient: '0x0000000000000000000000000000000000000000'});
  const [ txHash, setTxHash ] = useState('');
  const [ loanedAssetDetails, setLoanedAssetDetails ] = useState({symbol:'DAI'});
  const [ borrowAmount, setBorrowAmount ] = useState('');
  const [ loanAmount, setLoanAmount ] = useState('');
  const [ channelLoaded, setChannelLoaded ] = useState(false);

  const inputs = [
    {
      label: `Loan Amount (${loanedAssetDetails.symbol})`,
      value: loanAmount,
      type: "number",
      fx: setLoanAmount
    },
    {
      label: `Borrow Amount (${channelDetails.symbol})`,
      value: borrowAmount,
      type: "number",
      fx: setBorrowAmount
    }
  ];

  const confirmDetails = [
    `Channel Address: ${addressShortener(channelDetails.channelAddress)}`,
    `Recipient Address: ${addressShortener(channelDetails.recipient)}`,
    `Loan Amount: ${loanAmount} ${loanedAssetDetails.symbol}`,
    `Borrow Amount: ${borrowAmount} ${channelDetails.symbol}`
  ];

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
  const previousStep = () => {
    const newStep = step - 1;
    setStep(newStep)
  }

  const borrowChannelAsset = async () => {
    const sender = window.ethereum.selectedAddress;
    const tokenAddress = channelDetails.tokenAddress;
    const channelAddress = channelDetails.channelAddress;
    const loanDecimals = loanedAssetDetails.decimals;
    const borrowDecimals = channelDetails.decimals;
    const decimalLoanAmount = await formatBeforeSend(loanAmount, loanDecimals);
    const decimalBorrowAmount = await formatBeforeSend(borrowAmount, borrowDecimals);
    const borrowAssetSymbol = channelDetails.symbol;
    const loanedAssetSymbol = loanedAssetDetails.symbol;
    const loanedTokenAddress = loanedAssetDetails.tokenAddress;
    const loandTokenCTokenAddress = loanedAssetDetails.cTokenAddress;

    try{
      borrowAsset(
        sender,
        tokenAddress,
        channelAddress,
        decimalLoanAmount,
        decimalBorrowAmount,
        borrowAssetSymbol,
        loanedAssetSymbol,
        loanedTokenAddress,
        loandTokenCTokenAddress,
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

  const setLoanedAsset = (symbol) => {
    const assetDetails = assetData.find(asset => asset.symbol === symbol);
    setLoanedAssetDetails(assetDetails);
  }

  const inputLabel = `Channel: ${addressShortener(channelDetails.channelAddress)}`;
  const confirmHeading = 'Confirm your Transaction';
  
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
          <InputBox text={true} setToken={setLoanedAsset} dropDown={true} label={inputLabel} inputs={inputs} />
          <Flex>
            <Button onClick={previousStep}>Back</Button>
            <Button onClick={nextStep}>Next</Button>
          </Flex>
        </Flex>
      )
    case 3:
      return (
        <ConfirmationBox 
        image={{bool:false}}
        confirmButton={true}
        confirmHeading={confirmHeading} 
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
