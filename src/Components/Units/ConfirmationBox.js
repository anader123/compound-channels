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
  const { ERC20Details, nextStep, previousStep } = props;
  return (
    <Flex flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
      <Card sx={tallCardBoxFormatting}>
        <Flex flexDirection={'column'} alignItems={'center'}>
          <Heading mb={4}>Confirm your Transaction</Heading>
          <Image width={70} height={70} src={ERC20Details.image} />
          <Text>Asset: {ERC20Details.symbol}</Text>
          
        </Flex>
      </Card>
      <Flex>
          <Button onClick={previousStep}>Back</Button>
          <Button>Confirm</Button>
      </Flex>
    </Flex>
  )
}
