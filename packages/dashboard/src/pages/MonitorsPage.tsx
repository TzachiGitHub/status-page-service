import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useMonitorStore, type Monitor } from '../stores/monitorStore';
import MonitorModal from '../components/MonitorModal';
import clsx from 'clsx';

const STATUS_COLORS: Record<string, string> = {
  UP: 'bg-green-500',
  DOWN: 'bg-red-500',
  DEGRADED: 'bg-yellow-500',
  PAUSED: 'bg-slate-500',
};

const TYPE_COLORS: Record<string, string> = {
  HTTP: 'bg-blue-600',
  TCP: 'bg-purple-600',
  PING: 'bg-teal-600',
  SSL: 'bg-amber-600',
  HEARTBEAT: 'bg-pink-600',
  DNS: 'bg-cyan-600',
};

export default function MonitorsPage() {
  const { monitors, loading, fetchMonitors } = useMonitorStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchMonitors(); }, [fetchMonitors]);

  const filtered = monitors.filter((m) => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType && m.type !== filterType) return false;
    if (filterStatus && m.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Monitors</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium">
          <Plus size={16} /> New Monitor
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search monitors..." className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-sm">
          <option value="">All Types</option>
          {['HTTP', 'TCP', 'PING', 'SSL', 'HEARTBEAT', 'DNS'].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-sm">
          <option value="">All Status</option>
          {['UP', 'DOWN', 'DEGRADED', 'PAUSED'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-slate-400">No monitors found.</div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-left text-slate-400">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 hidden md:table-cell">Uptime</th>
                <th className="px-4 py-3 hidden md:table-cell">Avg Response</th>
                <th className="px-4 py-3 hidden lg:table-cell">Last Checked</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3">
                    <Link to={`/monitors/${m.id}`} className="font-medium text-indigo-400 hover:underline">{m.name}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('text-xs px-2 py-0.5 rounded text-white', TYPE_COLORS[m.type] || 'bg-slate-600')}>{m.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      <span className={clsx('w-2 h-2 rounded-full', STATUS_COLORS[m.status] || 'bg-slate-500')} />
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">{m.uptimePercent != null ? `${m.uptimePercent.toFixed(2)}%` : '—'}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{m.avgResponseTime != null ? `${m.avgResponseTime}ms` : '—'}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-slate-400">{m.lastCheckedAt ? new Date(m.lastCheckedAt).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <MonitorModal
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchMonitors(); }}
        />
      )}
    </div>
  );
}
