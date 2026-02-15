import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import api from '../lib/api';
import clsx from 'clsx';

interface Incident {
  id: string;
  title: string;
  status: string;
  impact: string;
  components?: { id: string; name: string }[];
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string;
}

const TABS = ['active', 'resolved', 'scheduled'] as const;
const IMPACTS = ['none', 'minor', 'major', 'critical'];
const STATUSES_CREATE = ['investigating', 'identified', 'monitoring', 'resolved'];

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [tab, setTab] = useState<typeof TABS[number]>('active');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [impact, setImpact] = useState('minor');
  const [status, setStatus] = useState('investigating');
  const [message, setMessage] = useState('');
  const [componentIds, setComponentIds] = useState<string[]>([]);
  const [components, setComponents] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [iRes, cRes] = await Promise.allSettled([
          api.get('/incidents'),
          api.get('/components'),
        ]);
        if (iRes.status === 'fulfilled') {
          const d = iRes.value.data;
          setIncidents(Array.isArray(d) ? d : d.incidents || d.data || []);
        }
        if (cRes.status === 'fulfilled') {
          const d = cRes.value.data;
          setComponents(Array.isArray(d) ? d : d.components || d.data || []);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = incidents.filter((i) => {
    if (tab === 'active') return i.status !== 'resolved' && !i.scheduledAt;
    if (tab === 'resolved') return i.status === 'resolved';
    return !!i.scheduledAt;
  });

  const [error, setError] = useState('');

  const handleCreate = async () => {
    setSaving(true);
    setError('');
    try {
      const { data } = await api.post('/incidents', {
        title,
        impact,
        status,
        message,
        componentIds: componentIds.length > 0 ? componentIds : undefined,
      });
      const incident = data.incident || data;
      navigate(`/incidents/${incident.id}`);
    } catch (err: unknown) {
      setError((err as any)?.response?.data?.error || 'Failed to create incident');
    } finally {
      setSaving(false);
    }
  };

  const impactColor = (imp: string) => {
    switch (imp?.toLowerCase()) {
      case 'critical': return 'bg-red-600 text-white';
      case 'major': return 'bg-orange-600 text-white';
      case 'minor': return 'bg-yellow-600 text-white';
      default: return 'bg-slate-600 text-white';
    }
  };

  const statusColor = (s: string) => {
    switch (s?.toLowerCase()) {
      case 'investigating': return 'text-red-400';
      case 'identified': return 'text-orange-400';
      case 'monitoring': return 'text-yellow-400';
      case 'resolved': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const inputCls = 'w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Incidents</h1>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium">
          <Plus size={16} /> New Incident
        </button>
      </div>

      <div className="flex gap-1 bg-white dark:bg-slate-800 rounded-lg p-1 w-fit">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={clsx('px-4 py-1.5 rounded text-sm capitalize', tab === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white')}
          >{t}</button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-slate-400">No {tab} incidents.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((i) => (
            <Link key={i.id} to={`/incidents/${i.id}`} className="block bg-white dark:bg-slate-800 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{i.title}</span>
                    <span className={clsx('text-xs px-1.5 py-0.5 rounded', impactColor(i.impact))}>{i.impact}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm">
                    <span className={clsx('capitalize', statusColor(i.status))}>{i.status}</span>
                    {i.components && i.components.length > 0 && (
                      <span className="text-slate-400">{i.components.map((c) => c.name).join(', ')}</span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-slate-400">{new Date(i.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreate(false)}>
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">New Incident</h2>
            {error && <div className="text-red-400 text-sm bg-red-900/30 p-2 rounded">{error}</div>}
            <div><label className="block text-xs text-slate-400 mb-1">Title</label><input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs text-slate-400 mb-1">Impact</label>
                <select value={impact} onChange={(e) => setImpact(e.target.value)} className={inputCls}>
                  {IMPACTS.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div><label className="block text-xs text-slate-400 mb-1">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
                  {STATUSES_CREATE.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div><label className="block text-xs text-slate-400 mb-1">Message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Affected Components</label>
              <div className="flex flex-wrap gap-2">
                {components.map((c) => (
                  <button key={c.id} type="button"
                    onClick={() => setComponentIds((prev) => prev.includes(c.id) ? prev.filter((x) => x !== c.id) : [...prev, c.id])}
                    className={clsx('px-2 py-1 rounded text-xs', componentIds.includes(c.id) ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300')}
                  >{c.name}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !title} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm disabled:opacity-50">{saving ? 'Creating...' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
