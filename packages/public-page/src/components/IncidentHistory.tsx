import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import type { Incident } from '../types';
import { IMPACT_CONFIG, formatDate, formatDateTime } from '../utils/status';

function DayGroup({ date, incidents }: { date: string; incidents: Incident[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-slate-100 dark:border-slate-800 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors px-1"
      >
        <span className="font-medium text-sm">{formatDate(date)}</span>
        <div className="flex items-center gap-2">
          {incidents.length === 0 ? (
            <span className="text-xs text-slate-400">No incidents</span>
          ) : (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {incidents.length} incident{incidents.length > 1 ? 's' : ''}
            </span>
          )}
          {incidents.length > 0 &&
            (open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
        </div>
      </button>
      {open && incidents.length > 0 && (
        <div className="pb-3 px-1 space-y-3">
          {incidents.map((inc) => {
            const impact = IMPACT_CONFIG[inc.impact] || IMPACT_CONFIG.none;
            return (
              <div key={inc.id} className="pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{inc.title}</span>
                  <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', impact.className)}>
                    {impact.label}
                  </span>
                </div>
                <div className="space-y-2">
                  {[...inc.updates]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((u) => (
                      <div key={u.id} className="text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-semibold capitalize">{u.status}</span> — {formatDateTime(u.createdAt)}
                        <p className="text-slate-700 dark:text-slate-300 mt-0.5">{u.message}</p>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function IncidentHistory({ incidents }: { incidents: Incident[] }) {
  const [showDays, setShowDays] = useState(14);
  const resolved = incidents.filter((i) => i.status === 'resolved' || i.status === 'postmortem');

  // Build day groups for the last N days
  const days: { date: string; incidents: Incident[] }[] = [];
  for (let i = 0; i < showDays; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({
      date: dateStr,
      incidents: resolved.filter((inc) => (inc.resolvedAt || inc.createdAt).slice(0, 10) === dateStr),
    });
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">Incident History</h2>
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg px-3">
        {days.map((d) => (
          <DayGroup key={d.date} date={d.date} incidents={d.incidents} />
        ))}
      </div>
      <button
        onClick={() => setShowDays((n) => n + 14)}
        className="mt-3 text-sm text-blue-500 hover:text-blue-600 transition-colors"
      >
        Load more history
      </button>
    </section>
  );
}
