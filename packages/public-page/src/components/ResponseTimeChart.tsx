import { useMemo } from 'react';
import type { ComponentMetrics } from '../types';

function MiniChart({ metrics }: { metrics: ComponentMetrics }) {
  const points = metrics.points;
  if (!points.length) return null;

  const values = points.map((p) => p.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const w = 400;
  const h = 60;

  const pathD = useMemo(() => {
    return points
      .map((p, i) => {
        const x = (i / Math.max(points.length - 1, 1)) * w;
        const y = h - ((p.value - min) / range) * (h - 4) - 2;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [points, min, range, w, h]);

  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">{metrics.componentName}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          avg {avg.toFixed(0)}ms
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16" preserveAspectRatio="none">
        <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

export function ResponseTimeChart({ metrics }: { metrics: ComponentMetrics[] }) {
  if (!metrics.length) return null;

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">Response Times</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {metrics.map((m) => (
          <MiniChart key={m.componentId} metrics={m} />
        ))}
      </div>
    </section>
  );
}
