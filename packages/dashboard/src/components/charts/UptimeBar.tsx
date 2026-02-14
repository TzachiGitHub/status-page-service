import { useState } from 'react';

interface UptimeBarData {
  date: string;
  uptimePercent: number;
  totalChecks: number;
  downChecks: number;
}

interface UptimeBarProps {
  bars: UptimeBarData[];
}

function getBarColor(uptimePercent: number, totalChecks: number): string {
  if (totalChecks === 0) return '#d1d5db'; // gray for no data
  if (uptimePercent === 100) return '#10b981'; // green
  if (uptimePercent >= 95) return '#f59e0b'; // yellow
  if (uptimePercent >= 90) return '#f97316'; // orange
  return '#ef4444'; // red
}

export function UptimeBar({ bars }: UptimeBarProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const totalBars = bars.length || 90;
  const displayBars = bars.length > 0 ? bars : Array.from({ length: 90 }, (_, i) => ({
    date: '',
    uptimePercent: 0,
    totalChecks: 0,
    downChecks: 0,
  }));

  const overallUptime =
    bars.length > 0
      ? bars.reduce((sum, b) => sum + (b.totalChecks > 0 ? b.uptimePercent : 0), 0) /
        (bars.filter((b) => b.totalChecks > 0).length || 1)
      : 0;

  return (
    <div className="w-full">
      <div
        className="flex gap-[2px] items-end relative"
        style={{ height: 34 }}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {displayBars.map((bar, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm cursor-pointer transition-opacity"
            style={{
              height: '100%',
              backgroundColor: getBarColor(bar.uptimePercent, bar.totalChecks),
              opacity: hoveredIndex !== null && hoveredIndex !== i ? 0.5 : 1,
              minWidth: 2,
            }}
            onMouseEnter={(e) => {
              setHoveredIndex(i);
              const rect = e.currentTarget.getBoundingClientRect();
              const parentRect = e.currentTarget.parentElement?.getBoundingClientRect();
              if (parentRect) {
                setTooltipPos({
                  x: rect.left - parentRect.left + rect.width / 2,
                  y: -8,
                });
              }
            }}
          />
        ))}

        {hoveredIndex !== null && displayBars[hoveredIndex] && displayBars[hoveredIndex].totalChecks > 0 && (
          <div
            className="absolute z-10 pointer-events-none"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
              <div className="font-medium">{displayBars[hoveredIndex].date}</div>
              <div className="text-gray-300 mt-1">
                {displayBars[hoveredIndex].uptimePercent.toFixed(2)}% uptime
              </div>
              <div className="text-gray-400">
                {displayBars[hoveredIndex].totalChecks} checks,{' '}
                {displayBars[hoveredIndex].downChecks} down
              </div>
              <div
                className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
                style={{
                  borderLeft: '5px solid transparent',
                  borderRight: '5px solid transparent',
                  borderTop: '5px solid #111827',
                }}
              />
            </div>
          </div>
        )}
      </div>
      <div className="text-sm text-gray-500 mt-2 text-center">
        {bars.length > 0 ? `${overallUptime.toFixed(2)}% uptime` : 'No data'}
      </div>
    </div>
  );
}
