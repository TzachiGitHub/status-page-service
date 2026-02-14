import { Wrench } from 'lucide-react';
import type { MaintenanceWindow } from '../types';
import { formatDateTime } from '../utils/status';

export function ScheduledMaintenance({ windows }: { windows: MaintenanceWindow[] }) {
  const upcoming = windows.filter((w) => w.status !== 'completed');
  if (!upcoming.length) return null;

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">Scheduled Maintenance</h2>
      <div className="space-y-3">
        {upcoming.map((w) => (
          <div
            key={w.id}
            className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-4 h-4 text-blue-500" />
              <h3 className="font-semibold text-sm">{w.title}</h3>
              {w.status === 'in_progress' && (
                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">In Progress</span>
              )}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{w.description}</p>
            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <div>
                <span className="font-medium">Start:</span> {formatDateTime(w.startTime)}
              </div>
              <div>
                <span className="font-medium">End:</span> {formatDateTime(w.endTime)}
              </div>
              {w.components.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {w.components.map((c) => (
                    <span key={c} className="bg-blue-100 dark:bg-blue-800/40 px-2 py-0.5 rounded text-xs">
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
