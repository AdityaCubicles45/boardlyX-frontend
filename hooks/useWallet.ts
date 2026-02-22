
import { useCallback } from 'react';
import { useStore } from '../store/useStore';

export const useWallet = () => {
  const { setWallet } = useStore();

  const connectWallet = useCallback(async () => {
    // Simulate ethers.js interaction
    try {
      if (typeof (window as any).ethereum !== 'undefined') {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        setWallet({
          address,
          isConnected: true,
          balance: (Math.random() * 5 + 1).toFixed(4),
          network: 'Ethereum Mainnet'
        });
      } else {
        // Mock connection for dev environment without Metamask
        setWallet({
          address: '0x71C...3E2d',
          isConnected: true,
          balance: '4.2561',
          network: 'Ethereum Mainnet (Mock)'
        });
      }
    } catch (error) {
      console.error('Wallet connection failed', error);
    }
  }, [setWallet]);

  const disconnectWallet = useCallback(() => {
    setWallet({
      address: null,
      isConnected: false,
      balance: '0.00'
    });
  }, [setWallet]);

  return { connectWallet, disconnectWallet };
};
