import React from 'react';
import { tallCardBoxFormatting } from '../../theme';

import {
  Flex,
  Card,
  Heading,
  Image,
  Text,
  Button
} from 'rebass';

export default function LoadingScreen(props) {
  const { 
    confirmFunction, 
    previousStep,
    confirmHeading,
    confirmDetails,
    image,
    confirmButton
  } = props;
  return (
    <Flex flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
      <Card sx={tallCardBoxFormatting} height={'400px'}>
        <Flex flexDirection={'column'} alignItems={'center'} height={'300px'}>
          <Heading sx={{textDecoration:'underline'}} mb={4}>{confirmHeading}</Heading>
          <Flex sx={{flexDirection:'column', justifyContent:'flex-start', alignItems:'space-around'}}>
            {confirmDetails.map((text, index) => {
              return <Text color={'#dee2e4'} m={'3px'} key={index}>{text}</Text>
            })}
          </Flex>
          {image.bool ? <Image sx={{marginTop:'30px', width:'75px', height:'auto'}} src={image.src} /> : <div/>}
        </Flex>
      </Card>
      <Flex>
          <Button onClick={previousStep}>Back</Button>
          {confirmButton?<Button onClick={confirmFunction}>Confirm</Button>:<div/>}
      </Flex>
    </Flex>
  )
}
