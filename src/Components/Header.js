import React, {useState} from 'react';
import styled from 'styled-components';
import piggyBank from '../Images/piggy-bank.svg'

import {
  Flex,
  Text,
  Box,
  Image,
  Link,
  Heading
} from 'rebass';

export default function Header(props) {
  const [ walletConnected, setWalletConnected ] = useState(false);
  const [ userAddress, setUserAddress ] = useState('');
  const [ shortUserAddress, setShortUserAddress ] = useState('');

  return (
    <Flex
      px={2}
      alignItems='center'>
        <Heading p={3} fontSize={[ 2, 4 ]}>
        Compound Channels
        </Heading >
        <Image 
          mr={[1, 4]}
          src={piggyBank}
          height='40px'
        />
      <Box mx='auto' />
      <div>
      {!walletConnected 
      ?
      <Text fontFamily={'Apercu'} mr={[1, 4]}>No Wallet Connected</Text>
      :
      <Link 
        target="_blank" 
        rel="noopener noreferrer"
        href={`https://kovan.etherscan.io/address/${userAddress}`}
      >
        <Text mr={[1, 4]}>Address: {shortUserAddress}</Text>
      </Link>
      }
      </div>
    </Flex>
  )
}