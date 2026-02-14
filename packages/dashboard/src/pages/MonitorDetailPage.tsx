import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Pause, Play, Trash2, Edit, ArrowLeft } from 'lucide-react';
import api from '../lib/api';
import { useMonitorStore, type Monitor } from '../stores/monitorStore';
import MonitorModal from '../components/MonitorModal';
import clsx from 'clsx';

interface Check {
  id: string;
  status: string;
  responseTime?: number;
  region?: string;
  error?: string;
  createdAt: string;
}

interface UptimeDay {
  date: string;
  uptime: number;
}

interface ResponseTimePoint {
  timestamp: string;
  responseTime: number;
}

export default function MonitorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deleteMonitor, pauseMonitor, resumeMonitor } = useMonitorStore();
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [checks, setChecks] = useState<Check[]>([]);
  const [uptimeDays, setUptimeDays] = useState<UptimeDay[]>([]);
  const [responseTimes, setResponseTimes] = useState<ResponseTimePoint[]>([]);
  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('24h');
  const [editModal, setEditModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [mRes, cRes, uRes, rtRes] = await Promise.allSettled([
        api.get(`/monitors/${id}`),
        api.get(`/monitors/${id}/checks`, { params: { limit: 50 } }),
        api.get(`/monitors/${id}/uptime`),
        api.get(`/monitors/${id}/response-times`, { params: { period } }),
      ]);
      if (mRes.status === 'fulfilled') setMonitor(mRes.value.data.monitor || mRes.value.data);
      if (cRes.status === 'fulfilled') {
        const d = cRes.value.data;
        setChecks(Array.isArray(d) ? d : d.checks || d.data || []);
      }
      if (uRes.status === 'fulfilled') {
        const d = uRes.value.data;
        setUptimeDays(Array.isArray(d) ? d : d.days || d.data || []);
      }
      if (rtRes.status === 'fulfilled') {
        const d = rtRes.value.data;
        setResponseTimes(Array.isArray(d) ? d : d.points || d.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [id, period]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!id || !confirm('Delete this monitor?')) return;
    await deleteMonitor(id);
    navigate('/monitors');
  };

  const handlePause = async () => {
    if (!id) return;
    await pauseMonitor(id);
    setMonitor((m) => m ? { ...m, status: 'PAUSED' } : m);
  };

  const handleResume = async () => {
    if (!id) return;
    await resumeMonitor(id);
    setMonitor((m) => m ? { ...m, status: 'UP' } : m);
  };

  if (loading) return <div className="text-center py-8 text-slate-400">Loading...</div>;
  if (!monitor) return <div className="text-center py-8 text-slate-400">Monitor not found.</div>;

  const statusColor: Record<string, string> = { UP: 'text-green-400', DOWN: 'text-red-400', DEGRADED: 'text-yellow-400', PAUSED: 'text-slate-400' };

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/monitors')} className="flex items-center gap-1 text-sm text-slate-400 hover:text-white">
        <ArrowLeft size={16} /> Back to Monitors
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            {monitor.name}
            <span className={clsx('text-sm font-normal', statusColor[monitor.status])}>{monitor.status}</span>
          </h1>
          <div className="flex gap-3 mt-1 text-sm text-slate-400">
            <span className="px-2 py-0.5 bg-slate-700 rounded text-xs">{monitor.type}</span>
            {monitor.uptimePercent != null && <span>Uptime: {monitor.uptimePercent.toFixed(2)}%</span>}
          </div>
        </div>
        <div className="flex gap-2">
          {monitor.status === 'PAUSED' ? (
            <button onClick={handleResume} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm"><Play size={14} /> Resume</button>
          ) : (
            <button onClick={handlePause} className="flex items-center gap-1 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm"><Pause size={14} /> Pause</button>
          )}
          <button onClick={() => setEditModal(true)} className="flex items-center gap-1 px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm"><Edit size={14} /> Edit</button>
          <button onClick={handleDelete} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm"><Trash2 size={14} /> Delete</button>
        </div>
      </div>

      {/* Response Time Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Response Time</h2>
          <div className="flex gap-1">
            {(['24h', '7d', '30d'] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={clsx('px-2 py-1 rounded text-xs', period === p ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300')}
              >{p}</button>
            ))}
          </div>
        </div>
        {responseTimes.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={responseTimes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v: string) => new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} unit="ms" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8, color: '#e2e8f0' }} />
              <Line type="monotone" dataKey="responseTime" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Uptime Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Uptime (Last 90 Days)</h2>
        {uptimeDays.length === 0 ? (
          <div className="text-slate-400 text-sm">No data yet</div>
        ) : (
          <div className="flex gap-0.5">
            {uptimeDays.slice(-90).map((d, i) => (
              <div
                key={i}
                title={`${d.date}: ${d.uptime.toFixed(1)}%`}
                className={clsx('flex-1 h-8 rounded-sm', d.uptime >= 99 ? 'bg-green-500' : d.uptime >= 95 ? 'bg-yellow-500' : d.uptime >= 0 ? 'bg-red-500' : 'bg-slate-600')}
              />
            ))}
          </div>
        )}
      </div>

      {/* Check Log */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Recent Checks</h2>
        {checks.length === 0 ? (
          <div className="text-slate-400 text-sm">No checks yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-700">
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Response Time</th>
                  <th className="px-3 py-2">Region</th>
                  <th className="px-3 py-2">Error</th>
                  <th className="px-3 py-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {checks.slice(0, 20).map((c) => (
                  <tr key={c.id} className="border-b border-slate-700/50">
                    <td className="px-3 py-2">
                      <span className={clsx('text-xs font-medium', c.status === 'UP' || c.status === 'success' ? 'text-green-400' : 'text-red-400')}>{c.status}</span>
                    </td>
                    <td className="px-3 py-2">{c.responseTime != null ? `${c.responseTime}ms` : '—'}</td>
                    <td className="px-3 py-2 text-slate-400">{c.region || '—'}</td>
                    <td className="px-3 py-2 text-red-400 text-xs max-w-[200px] truncate">{c.error || '—'}</td>
                    <td className="px-3 py-2 text-slate-400">{new Date(c.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editModal && (
        <MonitorModal
          monitor={monitor}
          onClose={() => setEditModal(false)}
          onSaved={(m) => { setMonitor(m); setEditModal(false); }}
        />
      )}
    </div>
  );
}
