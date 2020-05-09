import React, { useEffect } from 'react';
import piggyBank from '../Images/piggy-bank.svg'

import {
  Flex,
  Text,
  Box,
  Image,
  Link,
  Heading
} from 'rebass';

// Ethereum 
import { initializeWeb3 } from '../Ethereum/ContractInstances';
import { addressShortener } from '../Ethereum/EthHelper';

export default function Header(props) {
  const { 
    walletConnected, 
    userAddress, 
    shortUserAddress, 
    setShortUserAddress, 
    setUserAddress, 
    setWalletConnected 
  } = props;

  useEffect(() => {
    if(window.ethereum !== undefined) {
        if(window.ethereum.selectedAddress !== null 
          && window.ethereum.selectedAddress !== undefined) {
            const address = window.ethereum.selectedAddress;
            setUserAddress(address);
            setWalletConnected(true);
            initializeWeb3();
            const shortAddress = addressShortener(address);
            setShortUserAddress(shortAddress);

          // Sets display address if the user changes their address
          window.ethereum.on('accountsChanged', (accounts) => {
            setUserAddress(accounts[0]);
            const shortAddress = addressShortener(accounts[0]);
            setShortUserAddress(shortAddress);
          });
        }
      }
    }, [
      setUserAddress, 
      setShortUserAddress, 
      setWalletConnected, 
      userAddress
    ]);

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