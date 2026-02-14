import { useState } from 'react';
import clsx from 'clsx';
import type { ComponentUptime, UptimeDay } from '../types';

function barColor(day: UptimeDay): string {
  if (day.status === 'no_data') return 'bg-gray-300 dark:bg-gray-600';
  if (day.uptimePercent >= 99.5) return 'bg-emerald-500';
  if (day.uptimePercent >= 95) return 'bg-amber-500';
  return 'bg-red-500';
}

function Tooltip({ day, x }: { day: UptimeDay; x: number }) {
  const date = new Date(day.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  return (
    <div
      className="absolute bottom-full mb-2 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded shadow-lg whitespace-nowrap pointer-events-none z-10"
      style={{ left: `${x}px`, transform: 'translateX(-50%)' }}
    >
      <div className="font-medium">{date}</div>
      <div>{day.status === 'no_data' ? 'No data' : `${day.uptimePercent.toFixed(2)}% uptime`}</div>
    </div>
  );
}

export function UptimeBars({ data }: { data: ComponentUptime }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [tooltipX, setTooltipX] = useState(0);

  // Ensure 90 days
  const days: UptimeDay[] = [];
  for (let i = 0; i < 90; i++) {
    days.push(
      data.days[i] || {
        date: new Date(Date.now() - (89 - i) * 86400000).toISOString().slice(0, 10),
        uptimePercent: 0,
        status: 'no_data' as const,
      }
    );
  }

  return (
    <div className="mt-2 relative">
      <div
        className="flex gap-[1px] sm:gap-[2px] h-8"
        onMouseLeave={() => setHoverIdx(null)}
      >
        {days.map((day, i) => (
          <div
            key={i}
            className={clsx(
              'flex-1 rounded-[1px] sm:rounded-sm transition-opacity cursor-pointer min-w-[1px]',
              barColor(day),
              hoverIdx !== null && hoverIdx !== i && 'opacity-50'
            )}
            onMouseEnter={(e) => {
              setHoverIdx(i);
              const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
              setTooltipX(e.currentTarget.getBoundingClientRect().left - rect.left + e.currentTarget.offsetWidth / 2);
            }}
          />
        ))}
      </div>
      {hoverIdx !== null && <Tooltip day={days[hoverIdx]} x={tooltipX} />}
      <div className="flex justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
        <span>90 days ago</span>
        <span>{data.overallUptime.toFixed(2)}% uptime</span>
        <span>Today</span>
      </div>
    </div>
  );
}
