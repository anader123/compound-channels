import React, { useState } from 'react';

// Components
import Borrow from './Borrow';
import CardBox from './Units/CardBox';
import {
  Flex,
  Button
} from 'rebass';

// Images
import iBorrow from '../Images/borrow.svg';

const optionArray = [
  {name: "Borrow", step: 1, image: iBorrow},
  {name: "Supply", step: 1}
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
       <Borrow  setStep={setStep}/>   
      )
    // case 2:
    //   return (
    //    <Supply setStep={setStep}/>
    //   )
    default:
      return step;
  }
}
