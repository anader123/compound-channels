import React, { useState } from 'react';

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
  {name: "Create Channel", step: 1, image: iCreate},
  {name: "Sign Transaction", step: 2, image: iSign},
  {name: "Close Channel", step: 3, image: iClose},
  {name: "Add Assets", step: 4, image: iAdd},
  {name: "Inspect Signature", step: 5, image: iInspect},
  {name: "Repay Loan", step: 6, image: iRepay},
];

export default function Dashboard() {
  const [ step, setStep ] = useState(0); 

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
                        step={option.step}/>
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