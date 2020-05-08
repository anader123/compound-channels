import React, { useState } from 'react';

// Components
import Borrow from './Borrow';
import CardBox from './Units/CardBox';
import Supply from './Supply';

import {
  Flex,
  Button
} from 'rebass';

// Images
import iBorrow from '../Images/borrow.svg';
import iSupply from '../Images/supply.svg';

const optionArray = [
  {name: "Supply Assets", step: 1, image: iSupply},
  {name: "Borrow Assets", step: 2, image: iBorrow}
];

export default function Dashboard(props) {
  const { setStepDash } = props;
  const [ step, setStep ] = useState(0); 

  switch(step) {
    case 0:
      return (
        <Flex mt={'3%'}  sx={{ flexDirection:'column', alignItems:'center'}}>
          <Flex width={'75%'} m={4} sx={{ flexWrap: 'wrap',justifyContent:'center'}}>
            {optionArray.map((option, index) => {
              return <CardBox name={option.name} 
                        image={option.image}
                        key={index} 
                        setStep={setStep} 
                        step={option.step}/>
            })}
          </Flex>
          <Button width={'5em'} onClick={() => setStepDash(0)}>Back</Button>
        </Flex >
      )
    case 1:
      return (
        <Supply setStepDash={setStep} />
      )
    case 2: 
      return (
       <Borrow setStepDash={setStep} />   
      )
    default:
      return step;
  }
}
