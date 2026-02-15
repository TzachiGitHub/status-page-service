import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertTriangle, Users, Monitor as MonitorIcon } from 'lucide-react';
import api from '../lib/api';
import clsx from 'clsx';

interface MonitorSummary {
  id: string;
  name: string;
  status: string;
  uptimePercent?: number;
}

interface Incident {
  id: string;
  title: string;
  status: string;
  impact: string;
  createdAt: string;
}

export default function OverviewPage() {
  const [monitors, setMonitors] = useState<MonitorSummary[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [mRes, iRes, sRes] = await Promise.allSettled([
          api.get('/monitors'),
          api.get('/incidents'),
          api.get('/subscribers'),
        ]);
        if (mRes.status === 'fulfilled') {
          const d = mRes.value.data;
          setMonitors(Array.isArray(d) ? d : d.monitors || d.data || []);
        }
        if (iRes.status === 'fulfilled') {
          const d = iRes.value.data;
          setIncidents(Array.isArray(d) ? d : d.incidents || d.data || []);
        }
        if (sRes.status === 'fulfilled') {
          const d = sRes.value.data;
          const arr = Array.isArray(d) ? d : d.subscribers || d.data || [];
          setSubscriberCount(Array.isArray(arr) ? arr.length : d.total || 0);
        }
        // If all requests failed, show error
        if (mRes.status === 'rejected' && iRes.status === 'rejected' && sRes.status === 'rejected') {
          setError('Failed to load dashboard data. Please check your connection and try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const up = monitors.filter((m) => m.status === 'UP').length;
  const down = monitors.filter((m) => m.status === 'DOWN').length;
  const paused = monitors.filter((m) => m.status === 'PAUSED').length;
  const activeIncidents = incidents.filter((i) => i.status !== 'resolved').length;

  const statusColor = (s: string) => {
    switch (s) {
      case 'UP': return 'bg-green-500';
      case 'DOWN': return 'bg-red-500';
      case 'DEGRADED': return 'bg-yellow-500';
      default: return 'bg-slate-500';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-400">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle size={32} className="mx-auto mb-2 text-red-400" />
          <p className="text-red-400">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Overview</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card icon={<MonitorIcon size={20} />} label="Monitors" value={`${monitors.length}`} sub={`${up} up · ${down} down · ${paused} paused`} color="indigo" />
        <Card icon={<Activity size={20} />} label="Uptime" value={monitors.length - paused > 0 ? `${Math.round((up / (monitors.length - paused)) * 100)}%` : 'N/A'} sub={monitors.length - paused > 0 ? 'Currently operational' : 'All monitors paused'} color="green" />
        <Card icon={<AlertTriangle size={20} />} label="Active Incidents" value={`${activeIncidents}`} sub={activeIncidents === 0 ? 'All clear' : 'Needs attention'} color="red" />
        <Card icon={<Users size={20} />} label="Subscribers" value={`${subscriberCount}`} sub="Email subscribers" color="blue" />
      </div>

      {/* Monitor uptime bars */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Monitor Status</h2>
        {monitors.length === 0 ? (
          <p className="text-slate-400 text-sm">No monitors yet. <Link to="/monitors" className="text-indigo-400 hover:underline">Create one</Link></p>
        ) : (
          <div className="space-y-2">
            {monitors.map((m) => (
              <Link key={m.id} to={`/monitors/${m.id}`} className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                <div className={clsx('w-2.5 h-2.5 rounded-full', statusColor(m.status))} />
                <span className="flex-1 text-sm font-medium">{m.name}</span>
                <span className="text-xs text-slate-400">{m.uptimePercent != null ? `${m.uptimePercent.toFixed(1)}%` : '—'}</span>
                <div className="w-24 h-3 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden">
                  <div className={clsx('h-full rounded', statusColor(m.status))} style={{ width: `${m.uptimePercent ?? 0}%` }} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent incidents */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Recent Incidents</h2>
        {incidents.length === 0 ? (
          <p className="text-slate-400 text-sm">No incidents recorded.</p>
        ) : (
          <div className="space-y-2">
            {incidents.slice(0, 10).map((i) => (
              <Link key={i.id} to={`/incidents/${i.id}`} className="flex items-center justify-between p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                <div>
                  <span className="text-sm font-medium">{i.title}</span>
                  <span className={clsx('ml-2 text-xs px-1.5 py-0.5 rounded', impactColor(i.impact))}>{i.impact}</span>
                </div>
                <span className="text-xs text-slate-400">{new Date(i.createdAt).toLocaleDateString()}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function impactColor(impact: string) {
  switch (impact?.toLowerCase()) {
    case 'critical': case 'major': return 'bg-red-600 text-white';
    case 'minor': return 'bg-yellow-600 text-white';
    case 'maintenance': return 'bg-blue-600 text-white';
    default: return 'bg-slate-600 text-white';
  }
}

function Card({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub: string; color: string }) {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-500/10 text-indigo-400',
    green: 'bg-green-500/10 text-green-400',
    red: 'bg-red-500/10 text-red-400',
    blue: 'bg-blue-500/10 text-blue-400',
  };
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={clsx('p-2 rounded', colors[color])}>{icon}</div>
        <span className="text-sm text-slate-400">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{sub}</div>
    </div>
  );
}
