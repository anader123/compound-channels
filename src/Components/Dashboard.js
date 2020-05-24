import React from 'react';

// Components
import Add from './Add';
import CardBox from './Units/CardBox';
import Close from './CloseOptions';
import Create from './Create';
import Inspect from './Inspect';
import Repay from './Repay';
import Sign from './Sign';

import {
  Flex
} from 'rebass';

// Images
import iAdd from '../Images/add.svg';
import iClose from '../Images/close.svg';
import iCreate from '../Images/create.svg';
import iInspect from '../Images/inspect.svg';
import iRepay from '../Images/repay.svg';
import iSign from '../Images/sign.svg';

const optionArray = [
  {name: "Create Channel", step: 1, image: iCreate, text: "Create a new cChannel"},
  {name: "Sign Transaction", step: 2, image: iSign, text:"Senders can sign an amount"},
  {name: "Close Channel", step: 3, image: iClose, text:"Claim the funds in the channel"},
  {name: "Add Assets", step: 4, image: iAdd, text:"Add assets to the channel"},
  {name: "Inspect Signature", step: 5, image: iInspect, text:"Recipients can check if a sig is valid"},
  {name: "Repay Loan", step: 6, image: iRepay, text:"Repay any outstanding debt and withdaw collateral"},
];

export default function Dashboard(props) {
  const { step, setStep } = props;

  switch(step) {
    case 0:
      return (
        <Flex sx={{justifyContent:'center'}}>
          <Flex width={'75%'} m={4} sx={{ flexWrap: 'wrap',justifyContent:'center'}}>
            {optionArray.map(option => {
              return <CardBox name={option.name} 
                        image={option.image}
                        key={option.step+'key'} 
                        setStep={setStep} 
                        step={option.step}
                        text={option.text}/>
            })}
          </Flex>
        </Flex >
      )
    case 1: 
      return (
       <Create  setStepDash={setStep}/>   
      )
    case 2:
      return (
       <Sign setStepDash={setStep}/>
      )
    case 3:
      return (
       <Close setStepDash={setStep}/>
      )
    case 4:
      return (
       <Add setStepDash={setStep}/>
      )
    case 5:
      return (
      <Inspect setStepDash={setStep}/>
      )
    case 6:
      return (
      <Repay setStepDash={setStep}/>
      )
    default:
      return step;
  }
}