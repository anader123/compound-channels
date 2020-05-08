import React, { useState } from 'react';

// Components
import Close from './Close';
import ForceClose from './ForceClose';
import CardBox from './Units/CardBox';

import {
  Flex,
  Button
} from 'rebass';

// Images
import iClose from '../Images/close-money.svg';
import iForceClose from '../Images/forceClose.svg';

const optionArray = [
  {name: "Close", step: 1, image: iClose},
  {name: "Force Close", step: 1, image: iForceClose}
];

export default function Dashboard(props) {
  const { setStepDash } = props;
  const [ step, setStep ] = useState(0); 

  switch(step) {
    case 0:
      return (
        <Flex mt={'3%'}  sx={{ flexDirection:'column', alignItems:'center'}}>
          <Flex width={'75%'} m={4} sx={{ flexWrap: 'wrap',justifyContent:'center'}}>
            {optionArray.map(option => {
              return <CardBox name={option.name} 
                        image={option.image}
                        key={option.step+'key'} 
                        setStep={setStep} 
                        step={option.step}/>
            })}
          </Flex>
          <Button width={'5em'} onClick={() => setStepDash(0)}>Home</Button>
        </Flex >
      )
    case 1: 
      return (
       <Close setStepDash={setStepDash}  setStep={setStep}/>   
      )
    case 2:
      return (
       <ForceClose setStepDash={setStepDash} setStep={setStep}/>
      )
    default:
      return step;
  }
}

