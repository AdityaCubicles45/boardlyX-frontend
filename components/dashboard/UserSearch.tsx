import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import * as teamApi from '../../src/services/teamApi';
import type { SearchedUser } from '../../src/services/teamApi';

interface UserSearchProps {
  onSelect: (user: SearchedUser) => void;
  excludeIds?: string[];
  placeholder?: string;
  autoFocus?: boolean;
}

export const UserSearch: React.FC<UserSearchProps> = ({ onSelect, excludeIds = [], placeholder = 'Search by username or email...', autoFocus }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsFocused(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleChange(val: string) {
    setQuery(val);
    if (timer.current) clearTimeout(timer.current);
    if (val.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const users = await teamApi.searchUsers(val.trim());
        setResults(users.filter((u) => !excludeIds.includes(u.id)));
      } catch { setResults([]); }
      setLoading(false);
    }, 300);
  }

  function handleSelect(user: SearchedUser) {
    onSelect(user);
    setQuery('');
    setResults([]);
  }

  const showDropdown = isFocused && (results.length > 0 || (loading && query.length >= 2));

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
        <input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full bg-[#0F1117] border border-white/10 rounded-xl pl-9 pr-8 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 animate-spin" size={14} />}
        {query && !loading && (
          <button onClick={() => { setQuery(''); setResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40">
            <X size={14} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-[#1A1D25] border border-white/10 rounded-xl shadow-2xl shadow-black/40 z-50 max-h-[240px] overflow-y-auto">
          {loading && results.length === 0 ? (
            <div className="px-4 py-6 flex items-center justify-center text-white/30 text-xs">
              <Loader2 size={14} className="animate-spin mr-2" /> Searching...
            </div>
          ) : results.length === 0 && query.length >= 2 && !loading ? (
            <div className="px-4 py-6 text-center text-white/30 text-xs">No users found</div>
          ) : (
            results.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelect(user)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors text-left border-b border-white/5 last:border-0"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-500/20 flex-shrink-0">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || user.name || user.email}`} alt="" className="w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-medium truncate">{user.name || user.username || 'User'}</span>
                    {user.username && (
                      <span className="text-xs text-indigo-400 font-mono">@{user.username}</span>
                    )}
                  </div>
                  {user.email && <p className="text-[11px] text-white/30 truncate">{user.email}</p>}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
