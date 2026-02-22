import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { ListTodo, CheckCircle2, Clock, ShieldCheck, TrendingUp, Loader2 } from 'lucide-react';
import * as api from '../../src/services/api';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<api.AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getAnalytics()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load analytics');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[200px]">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200">
          {error || 'Failed to load analytics'}
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total tasks',
      value: data.totalTasks,
      icon: ListTodo,
      className: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    },
    {
      label: 'Completed',
      value: data.completedTasks,
      icon: CheckCircle2,
      className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      label: 'Pending',
      value: data.pendingTasks,
      icon: Clock,
      className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      label: 'On-chain verified',
      value: data.onChainVerifiedCount,
      icon: ShieldCheck,
      className: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <h2 className="text-xl font-bold text-white">Analytics</h2>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {stats.map((s) => (
          <Card key={s.label} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/50 mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-white">{s.value}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center border ${s.className}`}
              >
                <s.icon size={24} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="text-indigo-400" size={24} />
          <h3 className="text-lg font-bold text-white">Completion rate</h3>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white">{data.completionRatePercent}</span>
          <span className="text-white/50">%</span>
        </div>
        <div className="mt-3 h-2 w-full max-w-xs bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${data.completionRatePercent}%` }}
          />
        </div>
      </Card>
    </div>
  );
};
