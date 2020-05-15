import React, { useState } from 'react';
import './reset.css';
import './App.css';

// Rebass
import { ThemeProvider } from 'emotion-theming';
import theme from './theme';
// import preset from '@rebass/preset'

// Components
import ConnectWallet from './Components/ConnectWallet';
import Dashboard from './Components/Dashboard';
import Header from './Components/Header';

function App() {
  const [ walletConnected, setWalletConnected ] = useState(false);
  const [ userAddress, setUserAddress ] = useState('');
  const [ shortUserAddress, setShortUserAddress ] = useState('');
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <Header
        setWalletConnected={setWalletConnected} 
        setUserAddress={setUserAddress} 
        shortUserAddress={shortUserAddress} 
        userAddress={userAddress} 
        walletConnected={walletConnected} 
        setShortUserAddress={setShortUserAddress}
        />
        {!walletConnected
        ?
        <ConnectWallet 
        setShortUserAddress={setShortUserAddress} 
        setUserAddress={setUserAddress} 
        setWalletConnected={setWalletConnected} 
        />
        :
        <Dashboard />
        }
      </ThemeProvider>
    </div>
  );
}

export default App;
