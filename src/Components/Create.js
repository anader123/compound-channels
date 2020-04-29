import React, { useState } from 'react';

// Components
import InputBox from './Units/InputBox';
import ConfirmationBox from './Units/ConfirmationBox';
import TransactionBox from './Units/TransactionBox';
import LoadingScreen from './Units/LoadingScreen';

export default function CardBox() {
  const [ step, setStep ] = useState(1);
  switch(step) {
    case 1: 
      return (
       <InputBox /> 
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