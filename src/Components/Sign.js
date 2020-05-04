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
  const [ channelDetails, setChannelDetails ] = useState({channelAddress: '0x0000000000000000000000000000000000000000'});
  const [ signature, setSignature ] = useState('');

  const inputs = [
    {
      label: "Amount",
      value: signAmount,
      type: "number",
      fx: setSignAmount,
    }
  ];

  const nextStep = () => {
    const newStep = step + 1;
    setStep(newStep)
  }
  const previousStep = () => {
    const newStep = step - 1;
    setStep(newStep)
  }

  // FIXME: issue with getting the sig to return from the helper file.
  const createSig = async () => {
    const userAddress = window.ethereum.selectedAddress;
    const { tokenAddress, channelAddress } = channelDetails;
    const amount = await formatBeforeSend(signAmount, tokenAddress);
    const sig = await signData(userAddress, amount, channelAddress);
    await setSignature(sig);
    // nextStep();
    console.log(sig);
  }

  const updateChannel = (channel) => {
    setChannelDetails(channel);
    nextStep();
  }

  const inputLabel = `Channel: ${addressShortener(channelDetails.channelAddress)}`

  switch(step) {
    case 1: 
      return (
        <LoadingChannels updateChannel={updateChannel} previousStep={previousStep} nextStep={nextStep} />
      )
    case 2:
      return (
        <Flex flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
          <InputBox dropDown={false} label={inputLabel} inputs={inputs} />
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
          previousStep={previousStep} 
          nextStep={nextStep} 
        />
      )
    default:
      return step;
  }
}
