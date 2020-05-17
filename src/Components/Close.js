import React, { useState, useEffect } from 'react';

// Components
import LoadingChannels from './Units/LoadChannels';
import ConfirmationBox from './Units/ConfirmationBox';
import InputBox from './Units/InputBox';
import LoadingScreen from './Units/LoadingScreen';
import TransactionBox from './Units/TransactionBox';

// Ethereum
import { formatBeforeSend, addressShortener, loadChannels } from '../Ethereum/EthHelper';
import { closeChannel } from '../Ethereum/ChannelContractFunctions';

import {
  Flex,
  Button
} from 'rebass';

export default function Close(props) {
  const { setStepDash } = props;
  const [ step, setStep ] = useState(0);
  const [ amount, setAmount ] = useState(0); // not converted amount
  const [ channelDetails, setChannelDetails ] = useState({channelAddress: '0x0000000000000000000000000000000000000000', recipient: '0x0000000000000000000000000000000000000000'});
  const [ signature, setSignature ] = useState('');
  const [ channels, setChannels ] = useState([]);
  const [ txHash, setTxHash ] = useState('');
  const [ channelLoaded, setChannelLoaded ] = useState(false);

  const inputs = [
    {
      label: "Signature",
      value: signature,
      type: "string",
      fx: setSignature
    },
    {
      label: `Allotted Amount of ${channelDetails.symbol}`,
      value: amount,
      type: "number",
      fx: setAmount
    }
  ];

  const confirmDetails = [
    `Channel Address: ${addressShortener(channelDetails.channelAddress)}`,
    `Recipient Address: ${addressShortener(channelDetails.recipient)}`,
    `Allotted Amount: ${amount} ${channelDetails.symbol}`
  ];

  const getChannels = async () => {
    const userAddress = window.ethereum.selectedAddress;
    const returnChannels = await loadChannels(userAddress, 'recipient');
    setChannels(returnChannels);
    setChannelLoaded(true);
  }

  useEffect(() => {
    if(channels.length === 0) {
      getChannels();
    }
  }, [channels.length])

  const closeCompChannel = async () => {
    const symbol = channelDetails.symbol;
    const userAddress = window.ethereum.selectedAddress;
    const checkSumUserAddress = window.web3.toChecksumAddress(userAddress)
    const recipient = channelDetails.recipient;
    const channelAddress = channelDetails.channelAddress;
    const decimals = channelDetails.decimals;
    const decimalAmount = await formatBeforeSend(amount, decimals);

    try{
      closeChannel(
        symbol,
        userAddress, 
        checkSumUserAddress, 
        recipient, 
        channelAddress, 
        decimalAmount,
        signature,
        setStep,
        step,
        setTxHash
      );
    }
    catch(error) {
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

  const inputLabel = `Channel: ${addressShortener(channelDetails.channelAddress)}`

  switch(step) {
    case 0: 
      return (
        <LoadingChannels 
        channelLoaded={channelLoaded}
        addressType={'recipient address'}
        channels={channels} 
        setStepDash={setStepDash} 
        updateChannel={updateChannel} 
        previousStep={previousStep} 
        nextStep={nextStep} 
        />
      )
    case 1:
      return (
        <Flex flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
          <InputBox 
            text={true} 
            dropDown={false} 
            label={inputLabel} 
            inputs={inputs} 
            textInfo={[]} 
          />
          <Flex>
            <Button onClick={previousStep}>Back</Button>
            <Button onClick={nextStep}>Next</Button>
          </Flex>
        </Flex>
      )
    case 2:
      return (
        <ConfirmationBox 
          image={{bool:true,src:channelDetails.image}}
          confirmButton={true}
          previousStep={previousStep} 
          confirmDetails={confirmDetails}
          confirmHeading={"Close Channel"}
          confirmFunction={closeCompChannel}
        />
      )
    case 3:
      return (
        <LoadingScreen />
      )
    case 4:
      return (
        <TransactionBox setStepDash={setStepDash} channelAddress={channelDetails.channelAddress} txHash={txHash} assetDetails={channelDetails}/>
      )
    default:
      return step;
  }
}
