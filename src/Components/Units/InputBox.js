import React from 'react';

import {
  Flex,
  Button
} from 'rebass';
import {
  Label,
  Input
} from '@rebass/forms';

export default function InputBox(props) {
  const { inputs, handleInputChange } = props;

  return (
    <Flex flexDirection={'column'} justifyContent={'center'}>
      {/* {dropDown
      ?
      <div>Dropdown</div>
      :
      <>
      } */}
      {inputs.map((input) => {
        return (
          <Flex flexDirection={'column'} >
            <Label pb={1}>{input.label}</Label>
            <Input 
                type={input.type} 
                value={input.value} 
                onChange={(e) => input.fx(e.target.value)} 
                required
            />
          </Flex>
        )
      })}
    </Flex>
  )
}
