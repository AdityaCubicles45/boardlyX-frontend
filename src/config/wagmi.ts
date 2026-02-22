import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';

const sepoliaRpc = (import.meta as any).env?.VITE_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org';

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ projectId: '7f9c1d9e3cceb95d4b3ff6742d5a2a5b' }),
  ],
  transports: {
    [sepolia.id]: http(sepoliaRpc),
  },
});
