import React from 'react';
import { Button, Heading } from 'rebass';

// Ethereum 
import { initializeWeb3 } from '../Ethereum/ContractInstances';
import { addressShortener } from '../Ethereum/EthHelper';

export default function ConnectWallet(props) {
  const { setWalletConnected, setUserAddress, setShortUserAddress } = props;

  const connectWallet = async () => {
    if(window.ethereum) {
      // Make sure that the user is connected to Kovan
      if(window.ethereum.networkVersion === "42") {
        const accounts = await window.ethereum.enable();
        const address = accounts[0];
        // Sets up web3 connection
        initializeWeb3();
        // Pushes user to view
        setWalletConnected(true);
        setUserAddress(address);
        
        // Format Display Address
        const shortAddress = addressShortener(address);
        setShortUserAddress(shortAddress);
      }
      else{
        window.alert('Please switch to the Kovan Network.')
      }
    }
    else {
      window.alert('No Ethereum wallet detected.');
    }
  }
  return (
    <div>
      <Heading mt={6}>Please connect your Ethereum wallet to create a Channel.</Heading>
      <Button mt={4} onClick={connectWallet}>Connect Wallet</Button>
    </div>
  )
}
