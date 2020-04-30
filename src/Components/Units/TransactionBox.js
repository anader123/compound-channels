import React, { useState } from 'react';
import { tallCardBoxFormatting } from '../../theme';
import checkmark from '../../Images/checkmark.svg';

import {
  Flex,
  Text,
  Card,
  Image,
  Link,
  Heading,
  Button
} from 'rebass';



export default function TransactionBox(props) {
  // const { symbol, transactionHash, channelAddress } = props;
  const [ transactionHash ] = useState('txHash');
  const [ channelAddress ] = useState('address');
  // const [ shortChannelAddress, updateShortChannelAddress ] = useState('');
  return (
    <Flex flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
      <Card sx={tallCardBoxFormatting}>
        <Flex flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
          <Heading mb={4}>Transaction Confirmed</Heading>
          <Text mb={1}>Your channel was created at address:</Text>
          <Link
            target="_blank" 
            rel="noopener noreferrer"
            href={`https://kovan.etherscan.io/address/${channelAddress}`}>{channelAddress}</
          Link>
          <Image m={4} height={'100px'} width={'100px'} src={checkmark} />
          <Link 
            target="_blank" 
            rel="noopener noreferrer"
            href={`https://kovan.etherscan.io/tx/${transactionHash}`}>View on Etherscan</Link>
        </Flex>
      </Card>
          <Button>Home</Button>
    </Flex>
  )
}
