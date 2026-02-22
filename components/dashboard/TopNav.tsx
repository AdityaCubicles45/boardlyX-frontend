import React from 'react';
import { Search, Menu } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useStore } from '../../store/useStore';
import { SEPOLIA_CHAIN_ID } from '../../src/config/contract';
import { useChainId } from 'wagmi';
import { NotificationPopup } from './NotificationPopup';

export const TopNav: React.FC = () => {
  const { auth, wallet, setMobileMenuOpen } = useStore();
  const chainId = useChainId();
  const isSepolia = chainId === SEPOLIA_CHAIN_ID;

  return (
    <header className="h-16 md:h-20 border-b border-white/5 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 bg-[#0F1117]/80 backdrop-blur-md gap-3">
      <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all md:hidden flex-shrink-0">
        <Menu size={22} />
      </button>

      <div className="flex-1 max-w-xl hidden sm:block">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-indigo-400 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search projects, tasks, or team members..."
            className="w-full bg-[#1A1D25] border border-white/5 rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all text-white placeholder:text-white/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">
        <div className="flex items-center gap-2">
          {wallet.isConnected && (
            <span className={`px-2 py-1 rounded-lg text-xs font-medium hidden sm:inline-flex ${isSepolia ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
              {isSepolia ? 'Sepolia' : `Chain ${chainId}`}
            </span>
          )}
          <div className="hidden sm:block">
            <ConnectButton
              accountStatus="address"
              chainStatus="icon"
              showBalance={false}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <NotificationPopup />

          <div className="flex items-center gap-3 pl-3 md:pl-4 border-l border-white/5">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-white">{auth.user?.name || 'User'}</p>
              <p className="text-xs text-white/40">{auth.user?.username ? `@${auth.user.username}` : auth.user?.email || ''}</p>
            </div>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center overflow-hidden ring-2 ring-white/5 flex-shrink-0">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.user?.name || 'boardlyx'}`} alt="avatar" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
