import React, { useState } from 'react';

// Ethereum
import { formatBeforeSend } from '../Ethereum/EthHelper';
import { initalizeERC20 } from '../Ethereum/ContractInstances';
import { assetData } from '../Ethereum/AssetData';
import { tallCardBoxFormatting } from '../theme';

import {
  Input
} from '@rebass/forms';

import {
  Flex,
  Card,
  Button
} from 'rebass';

// Components
import InputBox from './Units/InputBox';
import ConfirmationBox from './Units/ConfirmationBox';
import TransactionBox from './Units/TransactionBox';
import LoadingScreen from './Units/LoadingScreen';
import TokenDropdown from './Units/TokenDropdown';

export default function CardBox(props) {
  const { setStepDash } = props;
  const [ step, setStep ] = useState(1);
  const [ depositAmount, setDepositAmount ] = useState(0);
  const [ endTime, setEndTime ] = useState(0);
  const [ recipientAddress, setRecipientAddress ] = useState('');
  const [ ERC20Details, setERC20Details ] = useState(assetData[0]);
  const label = 'Select an Asset';

  const nextStep = () => {
    const newStep = step + 1;
    setStep(newStep)
  }
  const previousStep = () => {
    const newStep = step - 1;
    setStep(newStep)
  }
  // const inputs = [
  //   {
  //     label: 'Deposit Amount',  
  //     type: 'number',
  //     value: depositAmount,
  //     fx: recordAmountInput
  //   },
  //   {
  //     label: 'Duration',  
  //     type: 'number',
  //     value: endTime,
  //     fx: setEndTime
  //   },
  // ]

  const setToken = (symbol) => {
    const index = assetData.map((token, index) => {
      if(token.symbol === symbol) {
        return index
      }
    });
    const tokenDetails = assetData[index];
    const address = tokenDetails.tokenAddress;
    setERC20Details(tokenDetails);
  }

  switch(step) {
    case 1: 
      return (
    <Flex flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
      <Card sx={tallCardBoxFormatting}>
        <Flex flexDirection={'column'} alignItems={'center'}>
            <div>{ERC20Details.name}</div>
            <TokenDropdown label={label} setToken={setToken} />
            {/* <Button onClick={() => setStepDash()}>Home</Button> */}
          {/* <div>
           <InputBox nextStep={nextStep} inputs={inputs} /> 
           <Input type='number' value={depositAmount} onChange={e => recordAmountInput(e.target.value)} />
          </div> */}
        </Flex>
      </Card>
          <Button onClick={nextStep}>Next</Button>
    </Flex>
      )
    case 2:
      return (
       <ConfirmationBox previousStep={previousStep} nextStep={nextStep} ERC20Details={ERC20Details}/>
      )
    case 3:
      return (
       <LoadingScreen />
      )
    case 4:
      return (
       <TransactionBox ERC20Details={ERC20Details}/>
      )
    default:
      return step;
  }
}