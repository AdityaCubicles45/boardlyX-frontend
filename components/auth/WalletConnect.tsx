import React, { useState, useRef } from 'react';
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '../ui/Button';
import { Wallet, AtSign } from 'lucide-react';
import { useStore } from '../../store/useStore';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';

export const WalletConnect: React.FC = () => {
  const { login } = useStore();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showUsernameStep, setShowUsernameStep] = useState(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [walletUsername, setWalletUsername] = useState('');
  const [walletName, setWalletName] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [savingUsername, setSavingUsername] = useState(false);
  const checkTimer = useRef<ReturnType<typeof setTimeout>>();

  const checkWalletUsername = (val: string) => {
    const clean = val.replace(/[^a-zA-Z0-9_]/g, '');
    setWalletUsername(clean);
    setUsernameStatus('idle');
    if (checkTimer.current) clearTimeout(checkTimer.current);
    if (clean.length < 3) return;
    setUsernameStatus('checking');
    checkTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/check-username?username=${encodeURIComponent(clean)}`);
        const data = await res.json();
        setUsernameStatus(data.available ? 'available' : 'taken');
      } catch { setUsernameStatus('idle'); }
    }, 400);
  };

  const handleSaveUsername = async () => {
    if (!pendingToken || usernameStatus !== 'available' || walletUsername.length < 3) return;
    setSavingUsername(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/set-username`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pendingToken}` },
        body: JSON.stringify({ username: walletUsername, name: walletName || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to set username');

      const u = data.user;
      login(
        {
          id: u.id,
          name: u.name || walletName || 'Wallet User',
          email: u.email || '',
          username: u.username,
          avatar: 'W',
        },
        pendingToken,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set username');
      setSavingUsername(false);
    }
  };

  const handleWalletAuth = async () => {
    if (!isConnected || !address) return;
    setIsAuthenticating(true);
    setError(null);

    try {
      const nonceRes = await fetch(`${API_BASE}/auth/wallet/nonce?address=${address}`);
      if (!nonceRes.ok) throw new Error('Failed to get authentication nonce');
      const { nonce } = await nonceRes.json();

      const message = `Sign in to boardlyX\n\nNonce: ${nonce}`;
      const signature = await signMessageAsync({ message });

      const loginRes = await fetch(`${API_BASE}/auth/wallet/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature }),
      });

      const data = await loginRes.json().catch(() => ({}));
      if (!loginRes.ok) throw new Error(data.error || 'Authentication failed');

      const { token, user, needsUsername } = data;
      if (!token || !user) throw new Error('Unexpected response from server');

      if (needsUsername) {
        setPendingToken(token);
        setPendingUser(user);
        setShowUsernameStep(true);
        setIsAuthenticating(false);
        return;
      }

      login(
        {
          id: user.id,
          name: user.name || user.walletAddress?.slice(0, 6) + '...' + user.walletAddress?.slice(-4) || 'Wallet User',
          email: user.email || '',
          username: user.username || '',
          avatar: 'W',
        },
        token,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to authenticate with wallet');
      setIsAuthenticating(false);
    }
  };

  if (showUsernameStep) {
    return (
      <div className="space-y-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
        <div className="flex items-center gap-2 mb-1">
          <AtSign size={16} className="text-indigo-500" />
          <h3 className="text-sm font-semibold text-slate-800">Choose your username</h3>
        </div>
        <p className="text-xs text-slate-500">Set a unique username so teammates can find and invite you.</p>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-medium text-slate-500 mb-1 block">Display Name</label>
            <input
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              placeholder="Your name"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 placeholder:text-slate-300"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500 mb-1 block">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
              <input
                value={walletUsername}
                onChange={(e) => checkWalletUsername(e.target.value)}
                placeholder="username"
                className={`w-full border rounded-xl pl-7 pr-10 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-300 ${usernameStatus === 'taken' ? 'border-red-300' : usernameStatus === 'available' ? 'border-emerald-300' : 'border-slate-200'
                  }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
                {usernameStatus === 'checking' && <span className="text-slate-400">...</span>}
                {usernameStatus === 'available' && <span className="text-emerald-500">&#10003;</span>}
                {usernameStatus === 'taken' && <span className="text-red-500">taken</span>}
              </span>
            </div>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleSaveUsername}
          disabled={usernameStatus !== 'available' || walletUsername.length < 3 || savingUsername}
          className="w-full rounded-xl bg-indigo-500 hover:bg-indigo-600 text-sm font-semibold disabled:opacity-50"
          size="lg"
          isLoading={savingUsername}
        >
          Continue to boardlyX
        </Button>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="space-y-3">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">{error}</div>
        )}
        <Button
          type="button"
          onClick={handleWalletAuth}
          className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-sm font-semibold shadow-lg shadow-purple-500/25"
          size="lg"
          isLoading={isAuthenticating}
        >
          <Wallet size={16} className="mr-2" />
          {isAuthenticating ? 'Signing in...' : `Sign in with ${address.slice(0, 6)}...${address.slice(-4)}`}
        </Button>
        <button type="button" onClick={() => disconnect()} className="w-full text-xs text-slate-400 hover:text-slate-600">
          Disconnect wallet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ConnectButton.Custom>
        {({ account, chain, openConnectModal, mounted }) => {
          const ready = mounted;
          const connected = ready && account && chain;
          return (
            <div>
              {!connected && (
                <Button
                  type="button"
                  onClick={openConnectModal}
                  className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-sm font-semibold shadow-lg shadow-purple-500/25"
                  size="lg"
                >
                  <Wallet size={16} className="mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
};
