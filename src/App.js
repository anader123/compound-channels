import React, { useState } from 'react';
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
  const [ walletConnected, setWalletConnected ] = useState(true);
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <Header />
        {!walletConnected
        ?
        <ConnectWallet />
        :
        <Dashboard />
        }
      </ThemeProvider>
    </div>
  );
}

export default App;
