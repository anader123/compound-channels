import React, { useState } from 'react';

// Components
import LoadingChannels from './Units/LoadChannels';
import ConfirmationBox from './Units/ConfirmationBox';
import InputBox from './Units/InputBox';

// Ethereum
import { formatBeforeSend, addressShortener, signData } from '../Ethereum/EthHelper';
import { tallCardBoxFormatting } from '../theme';

import {
  Input
} from '@rebass/forms';

import {
  Flex,
  Card,
  Button
} from 'rebass';

export default function Sign(props) {
  const { setStepDash } = props;
  const [ step, setStep ] = useState(1);
  const [ signAmount, setSignAmount ] = useState(0); // not converted amount
  const [ channelDetails, setChannelDetails ] = useState({channelAddress: '0x0000000000000000000000000000000000000000', recipient: '0x0000000000000000000000000000000000000000'});
  const [ signature, setSignature ] = useState('');

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
  ]

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
    const { tokenAddress, channelAddress } = channelDetails;
    const amount = await formatBeforeSend(signAmount, tokenAddress);
    if(+amount <= +channelDetails.balance) {
      await signData(userAddress, amount, channelAddress, setSignature, nextStep);
    }
    else {
      window.alert('Please enter a smaller amount')
    }
  }

  const updateChannel = (channel) => {
    setChannelDetails(channel);
    nextStep();
  }

  const inputLabel = `Channel: ${addressShortener(channelDetails.channelAddress)}`

  switch(step) {
    case 1: 
      return (
        <LoadingChannels setStepDash={setStepDash} updateChannel={updateChannel} previousStep={previousStep} nextStep={nextStep} />
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
