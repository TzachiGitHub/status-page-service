import { AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import type { Incident } from '../types';
import { IMPACT_CONFIG, formatDateTime } from '../utils/status';

function IncidentCard({ incident }: { incident: Incident }) {
  const impact = IMPACT_CONFIG[incident.impact] || IMPACT_CONFIG.none;
  const updates = [...incident.updates].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
        <h3 className="font-semibold text-base">{incident.title}</h3>
        <span className={clsx('px-2 py-0.5 rounded text-xs font-medium w-fit', impact.className)}>
          {impact.label}
        </span>
      </div>
      {incident.components.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {incident.components.map((c) => (
            <span key={c} className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {c}
            </span>
          ))}
        </div>
      )}
      <div className="border-l-2 border-slate-200 dark:border-slate-700 ml-2 pl-4 space-y-3">
        {updates.map((u) => (
          <div key={u.id}>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold capitalize">{u.status.replace('_', ' ')}</span>
              <span>—</span>
              <span>{formatDateTime(u.createdAt)}</span>
            </div>
            <p className="text-sm mt-1">{u.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActiveIncidents({ incidents }: { incidents: Incident[] }) {
  const active = incidents.filter((i) => i.status !== 'resolved' && i.status !== 'postmortem');
  if (!active.length) return null;

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">Active Incidents</h2>
      <div className="space-y-4">
        {active.map((i) => (
          <IncidentCard key={i.id} incident={i} />
        ))}
      </div>
    </section>
  );
}
