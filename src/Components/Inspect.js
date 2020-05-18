import React, { useState, useEffect } from 'react';

// Components
import LoadingChannels from './Units/LoadChannels';
import ConfirmationBox from './Units/ConfirmationBox';
import InputBox from './Units/InputBox';

// Ethereum
import { 
  formatBeforeSend, 
  addressShortener, 
  signatureShortener,
  verifySignature, 
  loadChannels
} from '../Ethereum/EthHelper';

// Images
import CheckMark from '../Images/checkmark.svg';
import Xmark from '../Images/xmark.svg';

import {
  Flex,
  Button
} from 'rebass';

export default function Inspect(props) {
  const { setStepDash } = props;
  const [ step, setStep ] = useState(1);
  const [ signAmount, setSignAmount ] = useState(0); // not converted amount
  const [ channelDetails, setChannelDetails ] = useState({channelAddress: '0x0000000000000000000000000000000000000000', sender: '0x0000000000000000000000000000000000000000'});
  const [ signature, setSignature ] = useState('');
  const [ sigStatus, setSigStatus ] = useState(false);
  const [ channels, setChannels ] = useState([]);
  const [ channelLoaded, setChannelLoaded ] = useState(false);

  const inputs = [
    {
      label: "Signature",
      value: signature,
      type: "string",
      fx: setSignature
    },
    {
      label: `Amount (${channelDetails.symbol})`,
      value: signAmount,
      type: "number",
      fx: setSignAmount
    }
  ];

  const textInfo = [
    `Channel: ${addressShortener(channelDetails.channelAddress)}`,
    `Balance: ${channelDetails.formattedBalance} ${channelDetails.symbol}`,
    `End Time: ${channelDetails.formattedEndTime}`
  ]


  const confirmDetails = [
    `Signature: ${signatureShortener(signature)}`,
    `Channel Address: ${addressShortener(channelDetails.channelAddress)}`,
    `Sender Address: ${addressShortener(channelDetails.sender)}`,
    `Amount: ${signAmount} ${channelDetails.symbol}`,
  ]

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
  
  const nextStep = () => {
    const newStep = step + 1;
    setStep(newStep)
  }
  const previousStep = () => {
    const newStep = step - 1;
    setStep(newStep)
  }

  const verifySig = async () => {
    const { channelAddress, sender, decimals, channelNonce } = channelDetails;
    const amount = await formatBeforeSend(signAmount, decimals);
    const returnValue = await verifySignature(
      sender, 
      amount, 
      channelNonce, 
      channelAddress,
      signature
      );
    setSigStatus(returnValue);
    nextStep()
  }

  const updateChannel = (channel) => {
    setChannelDetails(channel);
    nextStep();
  }
  
  switch(step) {
    case 1: 
      return (
        <LoadingChannels 
        addressType={'recipient address'}
        channelLoaded={channelLoaded} 
        channels={channels} 
        updateChannel={updateChannel} 
        previousStep={previousStep} 
        nextStep={nextStep} 
        setStepDash={setStepDash}
        />
      )
    case 2:
      return (
        <Flex flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
          <InputBox 
          text={true}
          textInfo={textInfo} 
          dropDown={false} 
          label={'Enter a Signature'} 
          inputs={inputs} 
          />
          <Flex>
            <Button onClick={previousStep}>Back</Button>
            <Button onClick={verifySig}>Verify Sig</Button>
          </Flex>
        </Flex>
      )
    case 3:
      return (
        <ConfirmationBox 
          image={{bool: true, src: sigStatus?CheckMark:Xmark}}
          confirmButton={false}
          previousStep={previousStep} 
          confirmDetails={confirmDetails}
          confirmHeading={sigStatus?'Valid Signature':'Invalid Signature'}
        />
      )
    default:
      return step;
  }
}
