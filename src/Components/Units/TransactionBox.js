import React from 'react';
import { tallCardBoxFormatting } from '../../theme';
import checkmark from '../../Images/checkmark.svg';
import { addressShortener } from '../../Ethereum/EthHelper';

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
  const { txHash, channelAddress, setStepDash } = props;
  return (
    <Flex flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
      <Card sx={tallCardBoxFormatting}>
        <Flex flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
          <Heading mb={4}>Transaction Confirmed</Heading>
          <Text mb={1}>Your channel was created at address:</Text>
          <Link
            target="_blank" 
            rel="noopener noreferrer"
            href={`https://kovan.etherscan.io/address/${channelAddress}`}>{addressShortener(channelAddress)}</Link>
          <Image m={4} height={'100px'} width={'100px'} src={checkmark} />
          <Link 
            target="_blank" 
            rel="noopener noreferrer"
            href={`https://kovan.etherscan.io/tx/${txHash}`}>View on Etherscan</Link>
        </Flex>
      </Card>
        <Button onClick={()=>setStepDash(0)}>Home</Button>
    </Flex>
  )
}
