import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus, ListTodo, CheckCircle2, Clock, ShieldCheck, TrendingUp,
  Loader2, ArrowRight, BarChart3, AlertTriangle, Users, Layers, ChevronRight,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { PerformanceChart, ChartDataPoint } from './PerformanceChart';
import * as api from '../../src/services/api';
import type { BoardTask } from '../../types';

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-500/20 text-red-300 border-red-500/30',
  medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

const COLUMN_COLORS: Record<string, string> = {
  backlog: 'bg-slate-500', todo: 'bg-blue-500', in_progress: 'bg-amber-500', review: 'bg-purple-500', done: 'bg-emerald-500',
};
const COLUMN_LABELS: Record<string, string> = {
  backlog: 'Backlog', todo: 'To Do', in_progress: 'In Progress', review: 'Review', done: 'Done',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function buildChartData(tasks: BoardTask[]): ChartDataPoint[] {
  const days: ChartDataPoint[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    const created = tasks.filter((t) => t.createdAt.slice(0, 10) === key).length;
    const completed = tasks.filter((t) => t.status === 'completed' && t.updatedAt.slice(0, 10) === key).length;
    days.push({ label, created, completed });
  }
  return days;
}

// ─── Recent Task Card (matches Kanban card style) ───────────────────
const RecentTaskCard: React.FC<{ task: BoardTask; onClick: () => void }> = ({ task, onClick }) => {
  const colColor = COLUMN_COLORS[task.boardColumn] || 'bg-slate-500';
  const colLabel = COLUMN_LABELS[task.boardColumn] || task.boardColumn;
  const isCompleted = task.status === 'completed';

  return (
    <button onClick={onClick}
      className="group text-left w-full bg-[#1A1D25] border border-white/[0.05] rounded-xl p-3.5 hover:border-white/[0.1] hover:bg-[#1D2028] transition-all active:scale-[0.98] cursor-pointer">
      {/* Priority + time */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium}`}>
          {task.priority}
        </span>
        {/* Column */}
        <span className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-white/[0.03]">
          <div className={`w-1.5 h-1.5 rounded-full ${colColor}`} />
          <span className="text-[9px] text-white/25 font-medium">{colLabel}</span>
        </span>
        <span className="text-[10px] text-white/20 ml-auto">{timeAgo(task.createdAt)}</span>
      </div>

      {/* Title */}
      <h4 className={`text-sm font-medium mb-1 leading-snug line-clamp-2 ${isCompleted ? 'text-white/35 line-through' : 'text-white/80'}`}>
        {task.title}
      </h4>
      {task.description && (
        <p className="text-[11px] text-white/25 line-clamp-1 mb-2">{task.description}</p>
      )}

      {/* Team */}
      {task.teamName && (
        <div className="flex items-center gap-1.5 mb-2">
          <Users size={10} className="text-indigo-400/60" />
          <span className="text-[10px] text-indigo-400/60 font-medium">{task.teamName}</span>
        </div>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-1.5">
          {/* On-chain */}
          {task.transactionHash && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium border bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              On-chain
            </span>
          )}
          {/* Assignees */}
          {task.assignees && task.assignees.length > 0 && (
            <div className="flex -space-x-1.5 ml-1">
              {task.assignees.slice(0, 3).map((a) => (
                <div key={a.user_id} className="w-5 h-5 rounded-full border border-[#1A1D25] overflow-hidden bg-indigo-500/20"
                  title={a.user_name || a.user_username || a.user_email || ''}>
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${a.user_username || a.user_name || a.user_email}`} alt="" className="w-full h-full" />
                </div>
              ))}
              {task.assignees.length > 3 && (
                <div className="w-5 h-5 rounded-full border border-[#1A1D25] bg-white/10 flex items-center justify-center text-[8px] text-white/50">
                  +{task.assignees.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
        {isCompleted && (
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">Done</span>
        )}
        <ChevronRight size={12} className="text-white/10 group-hover:text-white/30 transition-colors" />
      </div>
    </button>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────
export const OverviewPage: React.FC = () => {
  const { setCurrentPage, auth } = useStore();

  const [analytics, setAnalytics] = useState<api.AnalyticsResponse | null>(null);
  const [recentTasks, setRecentTasks] = useState<BoardTask[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, boardTasks] = await Promise.all([
        api.getAnalytics(),
        api.listMyBoardTasks(),
      ]);
      setAnalytics(analyticsRes);
      const sorted = [...boardTasks].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setRecentTasks(sorted.slice(0, 6));
      setChartData(buildChartData(boardTasks));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = analytics
    ? [
        { label: 'Total Tasks', value: analytics.totalTasks, icon: ListTodo, iconBg: 'bg-indigo-500/15 text-indigo-400', accent: 'from-indigo-500 to-indigo-600' },
        { label: 'Completed', value: analytics.completedTasks, icon: CheckCircle2, iconBg: 'bg-emerald-500/15 text-emerald-400', accent: 'from-emerald-500 to-emerald-600', badge: analytics.totalTasks > 0 ? `${analytics.completionRatePercent}%` : null },
        { label: 'Pending', value: analytics.pendingTasks, icon: Clock, iconBg: 'bg-amber-500/15 text-amber-400', accent: 'from-amber-500 to-amber-600' },
        { label: 'On-Chain', value: analytics.onChainVerifiedCount, icon: ShieldCheck, iconBg: 'bg-purple-500/15 text-purple-400', accent: 'from-purple-500 to-purple-600' },
      ]
    : [];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-indigo-400" />
          <span className="text-sm text-white/30">Loading overview...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 flex items-center gap-3">
          <AlertTriangle size={20} />
          <span>{error}</span>
          <Button size="sm" variant="secondary" onClick={fetchData} className="ml-auto">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">
            Welcome back, {auth.user?.name || auth.user?.username || 'User'}
          </h1>
          <p className="text-sm text-white/35 mt-1 hidden sm:block">Here's what's happening with your tasks today.</p>
        </div>
        <button onClick={() => setCurrentPage('tasks')}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all active:scale-95 self-start sm:self-auto">
          <span className="flex items-center justify-center w-5 h-5 rounded-md bg-white/20 group-hover:bg-white/30 transition-colors">
            <Plus size={14} strokeWidth={2.5} />
          </span>
          New Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="relative overflow-hidden group hover:border-white/10 transition-all">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] md:text-[11px] text-white/40 uppercase tracking-wider font-medium truncate">{s.label}</p>
                <div className="flex items-baseline gap-2 mt-1.5 md:mt-2">
                  <span className="text-2xl md:text-3xl font-bold text-white">{s.value}</span>
                  {'badge' in s && s.badge && (
                    <span className="text-[10px] md:text-xs font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">{s.badge}</span>
                  )}
                </div>
              </div>
              <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.iconBg}`}>
                <s.icon size={20} className="md:hidden" />
                <s.icon size={22} className="hidden md:block" />
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${s.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
          </Card>
        ))}
      </div>

      {/* Chart + Completion row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Performance chart */}
        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-bold text-white">Activity</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-[10px] text-white/30">Created</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-[10px] text-white/30">Done</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-white/20 mb-1">Last 7 days</p>
          <PerformanceChart data={chartData} />
        </Card>

        {/* Completion rate + Quick actions */}
        <div className="grid grid-rows-2 gap-4 md:gap-6">
          <Card className="relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400">
                <TrendingUp size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Completion Rate</h3>
                <p className="text-[10px] text-white/25">All time progress</p>
              </div>
              <div className="ml-auto flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">{analytics?.completionRatePercent ?? 0}</span>
                <span className="text-sm text-white/30">%</span>
              </div>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                style={{ width: `${analytics?.completionRatePercent ?? 0}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-white/20">
              <span>{analytics?.completedTasks ?? 0} done</span>
              <span>{analytics?.totalTasks ?? 0} total</span>
            </div>
          </Card>

          <Card className="flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Plus size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Quick Actions</h3>
                <p className="text-[10px] text-white/25">Jump to a section</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setCurrentPage('tasks')}
                className="flex-1 min-w-[100px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all active:scale-95">
                <Plus size={13} /> New Task
              </button>
              <button onClick={() => setCurrentPage('teams')}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] text-white text-xs font-semibold transition-all active:scale-95 border border-white/[0.06]">
                <Users size={13} /> Teams
              </button>
              <button onClick={() => setCurrentPage('analytics')}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] text-white text-xs font-semibold transition-all active:scale-95 border border-white/[0.06]">
                <BarChart3 size={13} /> Analytics
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Tasks - full width */}
      <div className="space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-white">Recent Tasks</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-white/40">
              {analytics?.totalTasks ?? 0} total
            </span>
          </div>
          <button onClick={() => setCurrentPage('tasks')}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors group/link">
            View all
            <ArrowRight size={13} className="group-hover/link:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {recentTasks.length === 0 ? (
          <Card className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
              <Layers size={28} className="text-indigo-400/40" />
            </div>
            <h4 className="text-white font-semibold mb-1">No tasks yet</h4>
            <p className="text-sm text-white/30 mb-5 max-w-[280px] mx-auto">
              Create your first task to see it appear here.
            </p>
            <button onClick={() => setCurrentPage('tasks')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 active:scale-95">
              <Plus size={14} /> Create Task
            </button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentTasks.map((task) => (
              <RecentTaskCard key={task.id} task={task} onClick={() => setCurrentPage('tasks')} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
