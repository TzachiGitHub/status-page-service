import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface UptimeDataPoint {
  date: string;
  uptime: number;
}

interface UptimeChartProps {
  data: UptimeDataPoint[];
  height?: number;
}

function getUptimeColor(uptime: number): string {
  if (uptime >= 99) return '#10b981';
  if (uptime >= 95) return '#f59e0b';
  return '#ef4444';
}

export function UptimeChart({ data, height = 300 }: UptimeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-gray-200"
        style={{ height }}
      >
        No data available
      </div>
    );
  }

  const avgUptime = data.reduce((sum, d) => sum + d.uptime, 0) / data.length;
  const fillColor = getUptimeColor(avgUptime);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: '#6b7280' }}
          tickLine={{ stroke: '#d1d5db' }}
        />
        <YAxis
          domain={[
            (dataMin: number) => Math.max(0, Math.floor(dataMin - 2)),
            100,
          ]}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          tickLine={{ stroke: '#d1d5db' }}
          label={{ value: '%', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: 'none',
            borderRadius: '8px',
            color: '#f9fafb',
            fontSize: 13,
          }}
          labelStyle={{ color: '#9ca3af' }}
          formatter={(value: number) => [`${value.toFixed(2)}%`, 'Uptime']}
        />
        <defs>
          <linearGradient id="uptimeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={fillColor} stopOpacity={0.3} />
            <stop offset="95%" stopColor={fillColor} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="uptime"
          stroke={fillColor}
          strokeWidth={2}
          fill="url(#uptimeGradient)"
          activeDot={{ r: 4, fill: fillColor, stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
