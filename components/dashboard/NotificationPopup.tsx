import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Bell, X, Check, CheckCheck, Users, UserPlus, UserMinus, Clock } from 'lucide-react';
import { useStore } from '../../store/useStore';
import * as teamApi from '../../src/services/teamApi';

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const typeIcons: Record<string, React.ElementType> = {
  team_invite: UserPlus,
  member_joined: Users,
  invite_rejected: UserMinus,
};

export const NotificationPopup: React.FC = () => {
  const { notifications, unreadNotifCount, setNotifications, markNotifRead, setCurrentPage, setActiveTeamId } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifs = useCallback(async () => {
    try {
      const data = await teamApi.getNotifications(30);
      setNotifications(data.notifications, data.unreadCount);
    } catch { /* ignore */ }
  }, [setNotifications]);

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifs]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleMarkRead(id: string) {
    try {
      await teamApi.markNotificationRead(id);
      markNotifRead(id);
    } catch { /* ignore */ }
  }

  async function handleMarkAllRead() {
    try {
      setLoading(true);
      await teamApi.markAllNotificationsRead();
      await fetchNotifs();
    } finally { setLoading(false); }
  }

  async function handleAcceptInvite(notifId: string, invitationId: string, teamId: string) {
    try {
      setAccepting(notifId);
      await teamApi.acceptInvitation(invitationId);
      await teamApi.markNotificationRead(notifId);
      markNotifRead(notifId);
      setActiveTeamId(teamId);
      setCurrentPage('teams');
      await fetchNotifs();
    } catch { /* ignore */ } finally { setAccepting(null); }
  }

  async function handleRejectInvite(notifId: string, invitationId: string) {
    try {
      setAccepting(notifId);
      await teamApi.rejectInvitation(invitationId);
      await teamApi.markNotificationRead(notifId);
      markNotifRead(notifId);
      await fetchNotifs();
    } catch { /* ignore */ } finally { setAccepting(null); }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all"
      >
        <Bell size={20} />
        {unreadNotifCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white px-1 border-2 border-[#0F1117]">
            {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-x-2 top-16 sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 w-auto sm:w-[400px] max-h-[70vh] sm:max-h-[520px] bg-[#1A1D25] border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-[100] flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">Notifications</h3>
              {unreadNotifCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium">{unreadNotifCount}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadNotifCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={loading}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <CheckCheck size={16} />
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white/60 transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-white/30">
                <Bell size={32} className="mb-3 opacity-40" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = typeIcons[n.type] || Bell;
                const isInvite = n.type === 'team_invite' && !n.read;
                const invitationId = (n.data?.invitationId as string) || '';
                const teamId = (n.data?.teamId as string) || '';
                const isProcessing = accepting === n.id;

                return (
                  <div
                    key={n.id}
                    className={`px-5 py-4 border-b border-white/5 transition-colors hover:bg-white/[0.02] ${!n.read ? 'bg-indigo-500/[0.03]' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                        n.type === 'team_invite' ? 'bg-indigo-500/20 text-indigo-400' :
                        n.type === 'member_joined' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!n.read ? 'text-white font-medium' : 'text-white/60'}`}>{n.title}</p>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="text-[11px] text-white/30 whitespace-nowrap flex items-center gap-1">
                              <Clock size={10} />
                              {timeAgo(n.created_at)}
                            </span>
                            {!n.read && !isInvite && (
                              <button
                                onClick={() => handleMarkRead(n.id)}
                                className="p-0.5 rounded text-white/20 hover:text-indigo-400 transition-colors"
                                title="Mark as read"
                              >
                                <Check size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-white/40 mt-0.5 truncate">{n.message}</p>

                        {isInvite && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleAcceptInvite(n.id, invitationId, teamId)}
                              disabled={isProcessing}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              <Check size={12} />
                              {isProcessing ? 'Joining...' : 'Accept'}
                            </button>
                            <button
                              onClick={() => handleRejectInvite(n.id, invitationId)}
                              disabled={isProcessing}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              <X size={12} />
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
