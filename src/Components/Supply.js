import React, { useState, useEffect } from 'react';

// Components
import LoadingChannels from './Units/LoadChannels';
import ConfirmationBox from './Units/ConfirmationBox';
import InputBox from './Units/InputBox';
import LoadingScreen from './Units/LoadingScreen';
import TransactionBox from './Units/TransactionBox';

// Ethereum
import { formatBeforeSend, addressShortener, loadChannels } from '../Ethereum/EthHelper';
import { supplyAssets } from '../Ethereum/ChannelContractFunctions';

import {
  Flex,
  Button
} from 'rebass';
import { assetData } from '../Ethereum/AssetData';

export default function Supply(props) {
  const { setStepDash } = props;

  const [ step, setStep ] = useState(1);
  const [ channels, setChannels ] = useState([]);
  const [ amount, setAmount ] = useState(0); // not converted decimal amount
  const [ channelDetails, setChannelDetails ] = useState(assetData[0]);
  const [ txHash, setTxHash ] = useState('');
  const [ channelLoaded, setChannelLoaded ] = useState(false);

  const inputs = [
    {
      label: `Amount (${channelDetails.symbol})`,
      value: amount,
      type: "number",
      fx: setAmount
    }
  ];

  const textInfo = [
    `Channel Address: ${addressShortener(channelDetails.channelAddress)}`,
    `Recipient Address: ${addressShortener(channelDetails.recipient)}`,
    `Channel Balance: ${channelDetails.formattedBalance} ${channelDetails.symbol}`
  ]

  const confirmDetails = [
    `Channel Address: ${addressShortener(channelDetails.channelAddress)}`,
    `Recipient Address: ${addressShortener(channelDetails.recipient)}`,
    `Amount: ${amount} ${channelDetails.symbol}`
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
  }, [channels.length])

  const nextStep = () => {
    const newStep = step + 1;
    setStep(newStep)
  }
  const previousStep = () => {
    const newStep = step - 1;
    setStep(newStep)
  }

  const supplyChannelAssets = async () => {
    const sender = window.ethereum.selectedAddress;
    const tokenAddress = channelDetails.tokenAddress;
    const channelAddress = channelDetails.channelAddress;
    const decimals = channelDetails.decimals;
    const decimalAmount = await formatBeforeSend(amount, decimals);
    const symbol = channelDetails.symbol;
    
    supplyAssets(
      sender,
      tokenAddress,
      channelAddress,
      decimalAmount,
      symbol,
      step,
      setStep,
      setTxHash
    );
  }

  const updateChannel = (channel) => {
    setChannelDetails(channel);
    nextStep();
  }

  
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
            dropDown={false} 
            label={'Choose an Amount'} 
            inputs={inputs} 
            textInfo={textInfo} 
          />
          <Flex>
            <Button onClick={previousStep}>Back</Button>
            <Button onClick={nextStep}>Next</Button>
          </Flex>
        </Flex>
      )
    case 3:
      return (
        <ConfirmationBox 
        image={{bool:true, src:channelDetails.image}}
        confirmButton={true}
        confirmHeading={'Confirm Deposit Amount'} 
        confirmDetails={confirmDetails} 
        previousStep={previousStep} 
        confirmFunction={supplyChannelAssets} 
        />
      )
    case 4:
      return (
        <LoadingScreen />
      )
    case 5:
      return (
        <TransactionBox 
        setStepDash={setStepDash} 
        txHash={txHash}
        txText={`Funds were successfully added: ${amount} ${channelDetails.symbol}`} 
        />
        
      )
    default:
      return step;
  }
}