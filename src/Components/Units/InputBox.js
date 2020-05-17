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
          <Heading sx={{textDecoration:'underline'}} mb={'20px'}>{label}</Heading>
          <Flex flexDirection={'column'} height={'300px'} alignItems={'flex-start'} justifyContent={'flex-start'}>
            {textInfo !== [] ?
              <Flex sx={{flexDirection:'column', justifyContent:'center', marginBottom:'30px'}}>
                {textInfo.map((info, index) => {
                  return (
                    <Text m={'3px'} key={index}>{info}</Text>
                  )
                })}
              </Flex>
            :
            <div/>
            }
          {dropDown?<TokenDropdown setToken={setToken} />:<div/>}
          {inputs.map((input, index) => {
            return (
              <Flex key={index} flexDirection={'column'} mt={'15px'} >
                <Label sx={{color:'#b1babf', fontSize:'0.85em'}} pb={1}>{input.label}</Label>
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
