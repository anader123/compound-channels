import React, { useState } from 'react';

// Components
import Add from './Add';
import Borrow from './Borrow';
import Close from './Close';
import Create from './Create';
import Repay from './Repay';
import Sign from './Sign';
import CardBox from './Units/CardBox';

const optionArray = [
  {name: "Create", case: 1},
  {name: "Sign", case: 2},
  {name: "Close", case: 3},
  {name: "Add", case: 4},
  {name: "Borrow", case: 5},
  {name: "Repay", case: 6},
];

export default function Dashboard() {
  const [ step, setStep ] = useState(0); 

  switch(step) {
    case 0:
      return (
        <div>
          {optionArray.map(option => {
            return <CardBox name={option.name} onClick={() => setStep(option.set)} />
          })}
        </div>
      )
    case 1: 
      return (
       <Create />   
      )
    case 2:
      return (
       <Sign />
      )
    case 3:
      return (
       <Close />
      )
    case 4:
      return (
       <Add />
      )
    case 5:
      return (
       <Borrow />
      )
    case 6:
      return (
      <Repay />
      )
    default:
      return step;
  }
}