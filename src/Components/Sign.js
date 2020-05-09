import React, { useState, useEffect } from 'react';

// Components
import LoadingChannels from './Units/LoadChannels';
import ConfirmationBox from './Units/ConfirmationBox';
import InputBox from './Units/InputBox';

// Ethereum
import { formatBeforeSend, addressShortener, signData, loadChannels } from '../Ethereum/EthHelper';

import {
  Flex,
  Button
} from 'rebass';

export default function Sign(props) {
  const { setStepDash } = props;
  const [ step, setStep ] = useState(1);
  const [ signAmount, setSignAmount ] = useState(0); // not converted amount
  const [ channelDetails, setChannelDetails ] = useState({channelAddress: '0x0000000000000000000000000000000000000000', recipient: '0x0000000000000000000000000000000000000000'});
  const [ signature, setSignature ] = useState('');
  const [ channels, setChannels ] = useState([]);
  const [ channelLoaded, setChannelLoaded ] = useState(false);

  const inputs = [
    {
      label: "Amount",
      value: signAmount,
      type: "number",
      fx: setSignAmount,
      text: `Balance: ${channelDetails.formattedBalance} ${channelDetails.symbol}`
    }
  ];

  const confirmDetails = [
    `Channel Address: ${addressShortener(channelDetails.channelAddress)}`,
    `Recipient Address: ${addressShortener(channelDetails.recipient)}`,
    `Amount: ${signAmount} ${channelDetails.symbol}`,
    `Signature: ${signature}`,
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

  const createSig = async () => {
    const userAddress = window.ethereum.selectedAddress;
    const { decimals, channelAddress } = channelDetails;
    const amount = await formatBeforeSend(signAmount, decimals);
    // if(+amount <= +channelDetails.balance) {
      await signData(userAddress, amount, channelAddress, setSignature, nextStep);
    // }
    // else {
    //   window.alert('Please enter a smaller amount')
    // }
  }

  const updateChannel = (channel) => {
    setChannelDetails(channel);
    nextStep();
  }

  const inputLabel = `Channel: ${addressShortener(channelDetails.channelAddress)}`

  switch(step) {
    case 1: 
      return (
        <LoadingChannels 
        channels={channels} 
        setStepDash={setStepDash} 
        updateChannel={updateChannel} 
        previousStep={previousStep} 
        nextStep={nextStep} 
        channelLoaded={channelLoaded}
        addressType={'sender address'}
        />
      )
    case 2:
      return (
        <Flex flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
          <InputBox text={true} dropDown={false} label={inputLabel} inputs={inputs} />
          <Flex>
            <Button onClick={previousStep}>Back</Button>
            <Button onClick={createSig}>Sign</Button>
          </Flex>
        </Flex>
      )
    case 3:
      return (
        <ConfirmationBox 
          image={{bool: false}}
          confirmButton={false}
          previousStep={previousStep} 
          confirmDetails={confirmDetails}
          confirmHeading={"Message Signed"}
        />
      )
    default:
      return step;
  }
}
