import React, {useState} from 'react';
import styled from 'styled-components';
import piggyBank from '../Images/piggy-bank.svg'

import {
  Flex,
  Text,
  Box,
  Image,
  Link
} from 'rebass';

export default function Header(props) {
  const [ walletConnected, setWalletConnected ] = useState(false);
  const [ userAddress, setUserAddress ] = useState('');
  const [ shortUserAddress, setShortUserAddress ] = useState('');

  return (
    <Flex
      px={2}
      alignItems='center'>
        <Text p={4} pl={0} fontSize={[ 2, 4 ]}>
        Compound Channels
        </Text>
        <Image 
          src={piggyBank}
          height='40px'
        />
      <Box mx='auto' />
      <div>
      {!walletConnected 
      ?
      <Text mr={[1, 4]}>No Wallet Connected</Text>
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