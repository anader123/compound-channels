import React, { useState } from 'react';

import { formatBeforeSend } from '../Ethereum/EthHelper';
import { initalizeERC20 } from '../Ethereum/ContractInstances';

// Components
import InputBox from './Units/InputBox';
import ConfirmationBox from './Units/ConfirmationBox';
import TransactionBox from './Units/TransactionBox';
import LoadingScreen from './Units/LoadingScreen';

export default function CardBox() {
  const [ step, setStep ] = useState(1);
  const [ depositAmount, setDepositAmount ] = useState(0);
  const [ decimalDepositAmount, setDecimalDepositAmount ] = useState('0');
  const [ endTime, setEndTime ] = useState(0);
  const [ recipientAddress, setRecipientAddress ] = useState('');
  const [ ERC20Address, setERC20Address ] = useState('');
  const dropDown = true;

  const recordAmountInput = async (value) => {
    const ERC20Contract = await initalizeERC20(ERC20Address);
    const decimalValue = formatBeforeSend(value, ERC20Contract);
    setDecimalDepositAmount(decimalValue);
  }
  const inputs = [
    {
      label: 'Deposit Amount',  
      type: 'number',
      value: depositAmount,
      fx: recordAmountInput
    },
    {
      label: 'Duration',  
      type: 'number',
      value: endTime,
      fx: setEndTime
    },
  ]


  switch(step) {
    case 1: 
      return (
       <InputBox inputs={inputs} /> 
      )
    case 2:
      return (
       <ConfirmationBox />
      )
    case 3:
      return (
       <LoadingScreen />
      )
    case 4:
      return (
       <TransactionBox />
      )
    default:
      return step;
  }
}