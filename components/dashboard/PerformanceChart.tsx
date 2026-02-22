import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export interface ChartDataPoint {
  label: string;
  created: number;
  completed: number;
}

interface Props {
  data: ChartDataPoint[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A1D25] border border-white/10 rounded-xl px-4 py-3 shadow-2xl shadow-black/40">
      <p className="text-[11px] font-semibold text-white/50 mb-1.5">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-xs text-white/70 capitalize">{entry.dataKey}</span>
          <span className="text-xs font-bold text-white ml-auto">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export const PerformanceChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="h-[200px] w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="chartCreated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="chartCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 11 }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="created" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#chartCreated)" />
          <Area type="monotone" dataKey="completed" stroke="#a855f7" strokeWidth={2.5} fillOpacity={1} fill="url(#chartCompleted)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
