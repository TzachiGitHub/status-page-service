import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MonitorSparklineProps {
  data: number[];
}

export function MonitorSparkline({ data }: MonitorSparklineProps) {
  if (!data || data.length === 0) {
    return <div style={{ width: 100, height: 40 }} />;
  }

  const chartData = data.slice(-20).map((value, index) => ({ index, value }));

  return (
    <div style={{ width: 100, height: 40 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke="#10b981"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
