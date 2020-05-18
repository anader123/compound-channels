import React, { useState, useEffect } from 'react';

// Components
import LoadingChannels from './Units/LoadChannels';
import ConfirmationBox from './Units/ConfirmationBox';
import LoadingScreen from './Units/LoadingScreen';
import TransactionBox from './Units/TransactionBox';

// Ethereum
import { addressShortener, loadChannels } from '../Ethereum/EthHelper';
import { forceClose } from '../Ethereum/ChannelContractFunctions';
import { assetData } from '../Ethereum/AssetData';

export default function ForceClose(props) {
  const { setStepDash } = props;
  const [ step, setStep ] = useState(0);
  const [ channelDetails, setChannelDetails ] = useState(assetData[0]);
  const [ channels, setChannels ] = useState([]);
  const [ txHash, setTxHash ] = useState('');
  const [ channelLoaded, setChannelLoaded ] = useState(false);

  const confirmDetails = [
    `Channel Address: ${addressShortener(channelDetails.channelAddress)}`,
    `Recipient Address: ${addressShortener(channelDetails.recipient)}`,
    `Allotted Amount: ${channelDetails.formattedBalance} ${channelDetails.symbol}`
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

  const forceCloseCompChannel = async () => {
    const userAddress = window.ethereum.selectedAddress;
    const checkSumUserAddress = window.web3.toChecksumAddress(userAddress)
    const sender = channelDetails.sender;
    const channelAddress = channelDetails.channelAddress; 
    const symbol = channelDetails.symbol;

    try{
      forceClose(
        sender, 
        checkSumUserAddress, 
        channelAddress,
        symbol,
        step,
        setStep,
        setTxHash
        );
    }
    catch (error){
      console.log(error);
    }
  }

  const nextStep = () => {
    const newStep = step + 1;
    setStep(newStep)
  }
  const previousStep = () => {
    const newStep = step - 1;
    setStep(newStep)
  }

  const updateChannel = (channel) => {
    setChannelDetails(channel);
    nextStep();
  }

  switch(step) {
    case 0: 
      return (
        <LoadingChannels 
        channels={channels} 
        setStepDash={setStepDash} 
        updateChannel={updateChannel} 
        previousStep={previousStep} 
        nextStep={nextStep} 
        addressType={'sender address'}
        channelLoaded={channelLoaded}
        />
      )
    case 1:
      return (
        <ConfirmationBox 
          image={{bool:true,src:channelDetails.image}}
          confirmButton={true}
          previousStep={previousStep} 
          confirmDetails={confirmDetails}
          confirmHeading={"Force Close Channel"}
          confirmFunction={forceCloseCompChannel}
        />
      )
    case 2:
      return (
        <LoadingScreen />
      )
    case 3:
      return (
        <TransactionBox 
        setStepDash={setStepDash} 
        channelAddress={channelDetails.channelAddress} 
        txHash={txHash} 
        txText={`The channel successfully closed: ${addressShortener(channelDetails.channelAddress)}`} 
        />
      )
    default:
      return step;
  }
}

