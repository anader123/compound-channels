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
          <Heading mb={4}>{confirmHeading}</Heading>
          {image.bool ? <Image width={70} height={70} src={image.src} /> : <div/>}
          {confirmDetails.map((text, index) => {
            return <Text key={index}>{text}</Text>
          })}
        </Flex>
      </Card>
      <Flex>
          <Button onClick={previousStep}>Back</Button>
          {confirmButton?<Button onClick={confirmFunction}>Confirm</Button>:<div/>}
      </Flex>
    </Flex>
  )
}
