import React from 'react';
import './App.css';

// Rebass
import { ThemeProvider } from 'emotion-theming';
import theme from './theme';

// Components
import Header from './Components/Header'

function App() {
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <Header />
      </ThemeProvider>
    </div>
  );
}

export default App;
