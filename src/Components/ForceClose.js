import React, { useState, useEffect } from 'react';

// Components
import LoadingChannels from './Units/LoadChannels';
import ConfirmationBox from './Units/ConfirmationBox';
import LoadingScreen from './Units/LoadingScreen';
import TransactionBox from './Units/TransactionBox';

// Ethereum
import { addressShortener, loadChannels } from '../Ethereum/EthHelper';
import { initalizeERC20Channel, initalizeEthChannel } from '../Ethereum/ContractInstances';

export default function ForceClose(props) {
  const { setStepDash } = props;
  const [ step, setStep ] = useState(0);
  const [ channelDetails, setChannelDetails ] = useState({channelAddress: '0x0000000000000000000000000000000000000000', recipient: '0x0000000000000000000000000000000000000000'});
  const [ channels, setChannels ] = useState([]);
  const [ txHash, setTxHash ] = useState('');
  const [ channelAddress, setChannelAddress ] = useState('');
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

  const forceCloseChannel = async () => {
    const userAddress = window.ethereum.selectedAddress;
    const checkSumUserAddress = window.web3.toChecksumAddress(userAddress)
    const sender = channelDetails.sender;
    let channelContract;

    if(checkSumUserAddress === sender) {
      const channelAddress = channelDetails.channelAddress;  
      // Sets up contract instances for either Eth or ERC20
      if(channelDetails.symbol === 'ETH') {
        channelContract = await initalizeEthChannel(channelAddress);
      }
      else {
        channelContract = await initalizeERC20Channel(channelAddress);
      }
  
      channelContract.methods.forceClose().send({from: userAddress})
      .once('transactionHash', (transactionHash) => {
        setStep(step + 1);
        setTxHash(transactionHash);
      })
      .once('receipt', (receipt) => {
        setStep(step + 2);
        setChannelAddress(receipt.events.rChannelCreated.eturnValues.channelAddress);
      })
      .on('error', console.error);
    }
    else {
      window.alert('Current address is not the sender for this channel');
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
          confirmFunction={forceCloseChannel}
        />
      )
    case 2:
      return (
        <LoadingScreen />
      )
    case 3:
      return (
        <TransactionBox setStepDash={setStepDash} channelAddress={channelAddress} txHash={txHash} assetDetails={channelDetails}/>
      )
    default:
      return step;
  }
}

