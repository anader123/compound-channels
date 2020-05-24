import React, { useState } from 'react';
import {
  Box,
  Card,
  Image,
  Heading,
  Text
} from 'rebass';

import { cardBoxFormatting } from '../../theme';

export default function CardBox(props) {
  const { name, step, setStep, image, text } = props;
  const [ hovered, setHovered ] = useState(false);
  return (
    <Box onClick={() => setStep(step)}>
      <Card 
      onMouseOver={()=>{setHovered(true)}}
      onMouseOut={()=>{setHovered(false)}}
      sx={cardBoxFormatting}>
        <Image width={'auto'} m={2} height={'30%'} src={image} />
        <Heading>{name}</Heading>
        {hovered?<Text color={'rgb(209, 202, 202)'} p={'3px'} fontSize={'.8em'}>{text}</Text>:<Text height={'5px'}/>}
      </Card>
    </Box>
  )
}
