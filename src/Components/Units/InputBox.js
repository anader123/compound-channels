import React from 'react';
import { tallCardBoxFormatting } from '../../theme';
import {
  Flex,
  Heading,
  Card,
  Text
} from 'rebass';
import {
  Label,
  Input
} from '@rebass/forms';
import TokenDropdown from './TokenDropdown';

export default function InputBox(props) {
  const {
    inputs,
    dropDown, 
    setToken, 
    label, 
    textInfo 
  } = props;

  return (
    <Flex flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
      <Card sx={tallCardBoxFormatting}>
        <Flex flexDirection={'column'} alignItems={'flex-start'} height={'350px'}>
          <Heading mb={'40px'}>{label}</Heading>
          <Flex flexDirection={'column'} height={'200px'} justifyContent={'space-around'}>
          {textInfo.map((info, index) => {
            return (
              <Text key={index}>{info.text}</Text>
            )
          })}
          {dropDown?<TokenDropdown setToken={setToken} />:<div/>}
          {inputs.map((input, index) => {
            return (
              <Flex key={index} flexDirection={'column'} mt={'5px'} >
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
        </Flex>
      </Card>
    </Flex>
  )
}
