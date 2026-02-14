import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ResponseTimeDataPoint {
  time: string;
  responseTime: number;
}

interface ResponseTimeChartProps {
  data: ResponseTimeDataPoint[];
  height?: number;
}

export function ResponseTimeChart({ data, height = 300 }: ResponseTimeChartProps) {
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

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 12, fill: '#6b7280' }}
          tickLine={{ stroke: '#d1d5db' }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#6b7280' }}
          tickLine={{ stroke: '#d1d5db' }}
          label={{ value: 'ms', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
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
          formatter={(value: number) => [`${value} ms`, 'Response Time']}
        />
        <Line
          type="monotone"
          dataKey="responseTime"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
