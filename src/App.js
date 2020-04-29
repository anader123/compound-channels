import React, { useState } from 'react';
import './App.css';

// Rebass
import { ThemeProvider } from 'emotion-theming';
import theme from './theme';

// Components
import ConnectWallet from './Components/ConnectWallet';
import Dashboard from './Components/Dashboard';
import Header from './Components/Header';

function App() {
  const [ walletConnected, setWalletConnected ] = useState(false);
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
