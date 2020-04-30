import React, { useState } from 'react';

// Components
import LoadingChannels from './Units/LoadChannels';
import ConfirmationBox from './Units/ConfirmationBox';
import TransactionBox from './Units/TransactionBox';

// Ethereum
import { formatBeforeSend } from '../Ethereum/EthHelper';
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
  const [ signAmount, setSignAmount ] = useState('0');
  const [ decimalsSignAmount, setDecimalsSignAmount ] = useState('0')
  const [ endTime, setEndTime ] = useState(0);
  const [ recipientAddress, setRecipientAddress ] = useState('');
  const [ ERC20Details, setERC20Details ] = useState({});

  const nextStep = () => {
    const newStep = step + 1;
    setStep(newStep)
  }
  const previousStep = () => {
    const newStep = step - 1;
    setStep(newStep)
  }

  switch(step) {
    case 1: 
      return (
        <LoadingChannels previousStep={previousStep} nextStep={nextStep} />
      )
    case 2:
      return (
       <input />
      )
    case 3:
      return (
        <ConfirmationBox 
          previousStep={previousStep} 
          nextStep={nextStep} 
          ERC20Details={ERC20Details}
        />
      )
    case 4:
      return (
       <TransactionBox ERC20Details={ERC20Details}/>
      )
    default:
      return step;
  }
}
