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
    ERC20Details, 
    confirmFunction, 
    previousStep,
    confirmHeading,
    confirmDetails,
    image 
  } = props;
  return (
    <Flex flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
      <Card sx={tallCardBoxFormatting}>
        <Flex flexDirection={'column'} alignItems={'center'}>
          <Heading mb={4}>{confirmHeading}</Heading>
          {image.bool ? <Image width={70} height={70} src={image.src} /> : <div/>}
          {confirmDetails.map(text => {
            return <Text>{text}</Text>
          })}
        </Flex>
      </Card>
      <Flex>
          <Button onClick={previousStep}>Back</Button>
          <Button onClick={confirmFunction}>Confirm</Button>
      </Flex>
    </Flex>
  )
}
