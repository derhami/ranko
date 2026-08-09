/**
 * Recharts LineChart showing score trend over time.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ScoreTrendPoint } from '../../shared/ipc-types.js';

interface ScoreTrendProps {
  data: ScoreTrendPoint[];
}

export function ScoreTrend({ data }: ScoreTrendProps) {
  if (data.length < 2) {
    return (
      <div className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>
        جهت مشاهده نمودار روند تغییرات امتیاز، حداقل ۲ ممیزی برای این دامنه انجام دهید.
      </div>
    );
  }

  const chartData = data
    .map((d) => ({
      date: new Date(d.date).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' }),
      امتیاز: d.score,
    }))
    .reverse(); // Oldest first

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
          axisLine={{ stroke: 'var(--color-border)' }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
          axisLine={{ stroke: 'var(--color-border)' }}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: 12,
          }}
          labelStyle={{ color: 'var(--color-text-secondary)' }}
        />
        <Line
          type="monotone"
          dataKey="امتیاز"
          stroke="var(--color-accent)"
          strokeWidth={2}
          dot={{ r: 4, fill: 'var(--color-accent)' }}
          activeDot={{ r: 6, fill: 'var(--color-accent)' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
