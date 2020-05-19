import React from 'react';
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
  const { txHash, txText, setStepDash } = props;
  return (
    <Flex flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
      <Card sx={tallCardBoxFormatting}>
        <Flex flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
          <Heading sx={{textDecoration:'underline', marginBottom:'50px'}}>Transaction Confirmed</Heading>
          <Text mb={1} textAlign={'center'}>{txText}</Text>
          <Image m={4} height={'100px'} width={'100px'} src={checkmark} />
          <Link 
            sx={{textDecoration:'underline'}}
            target="_blank" 
            rel="noopener noreferrer"
            href={`https://kovan.etherscan.io/tx/${txHash}`}>View on Etherscan</Link>
        </Flex>
      </Card>
        <Button onClick={()=>setStepDash(0)}>Home</Button>
    </Flex>
  )
}
