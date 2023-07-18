import { WagmiConfig, configureChains, createClient } from 'wagmi';
import './App.css';
import { Header } from './components/Header';
import { publicProvider } from "wagmi/providers/public";
import { SnackbarProvider } from 'notistack';
import { Deposit } from './components/Deposit';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CHAINS } from './constants';
import { useState } from 'react';
import { Withdraw } from './components/Withdraw';

function App() {

  const { provider } = configureChains(CHAINS, [publicProvider()]);
  const wagmiClient = createClient({
    autoConnect: true,
    provider,
  });

  const [toRefresh, setToRefresh] = useState(false);
  return (
    <WagmiConfig client={wagmiClient}>
      <SnackbarProvider autoHideDuration={3000}>
        <BrowserRouter>
          <Header toRefresh={toRefresh} setToRefresh={setToRefresh} />
          <Routes>
            <Route path="/" element={<Deposit toRefresh={toRefresh} setToRefresh={setToRefresh} />} />
            <Route path="/deposit" element={<Deposit toRefresh={toRefresh} setToRefresh={setToRefresh} />} />
            <Route path="/withdraw" element={<Withdraw toRefresh={toRefresh} setToRefresh={setToRefresh} />} />
          </Routes>
        </BrowserRouter>
      </SnackbarProvider>
    </WagmiConfig>
  );
}

export default App;
