import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Edit, CheckCircle } from 'lucide-react';
import api from '../lib/api';
import clsx from 'clsx';

interface IncidentUpdate {
  id: string;
  status: string;
  message: string;
  createdAt: string;
}

interface Incident {
  id: string;
  title: string;
  status: string;
  impact: string;
  components?: { id: string; name: string }[];
  updates?: IncidentUpdate[];
  createdAt: string;
}

const STATUSES = ['investigating', 'identified', 'monitoring', 'resolved'];

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateStatus, setUpdateStatus] = useState('monitoring');
  const [updateMessage, setUpdateMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editImpact, setEditImpact] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await api.get(`/incidents/${id}`);
      const inc = data.incident || data;
      setIncident(inc);
      setEditTitle(inc.title);
      setEditImpact(inc.impact);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleAddUpdate = async () => {
    if (!id || !updateMessage.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/incidents/${id}/updates`, { status: updateStatus, message: updateMessage });
      setUpdateMessage('');
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async () => {
    if (!id) return;
    await api.patch(`/incidents/${id}`, { status: 'resolved' });
    await load();
  };

  const handleDelete = async () => {
    if (!id || !confirm('Delete this incident?')) return;
    await api.delete(`/incidents/${id}`);
    navigate('/incidents');
  };

  const handleEditSave = async () => {
    if (!id) return;
    await api.patch(`/incidents/${id}`, { title: editTitle, impact: editImpact });
    setEditing(false);
    await load();
  };

  const statusColor = (s: string) => {
    switch (s?.toLowerCase()) {
      case 'investigating': return 'bg-red-600';
      case 'identified': return 'bg-orange-600';
      case 'monitoring': return 'bg-yellow-600';
      case 'resolved': return 'bg-green-600';
      default: return 'bg-slate-600';
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

  const inputCls = 'w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

  if (loading) return <div className="text-center py-8 text-slate-400">Loading...</div>;
  if (!incident) return <div className="text-center py-8 text-slate-400">Incident not found.</div>;

  const updates = incident.updates || [];

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/incidents')} className="flex items-center gap-1 text-sm text-slate-400 hover:text-white">
        <ArrowLeft size={16} /> Back to Incidents
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {editing ? (
            <div className="space-y-2">
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className={inputCls} />
              <select value={editImpact} onChange={(e) => setEditImpact(e.target.value)} className={inputCls}>
                {['none', 'minor', 'major', 'critical'].map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={handleEditSave} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">Save</button>
                <button onClick={() => setEditing(false)} className="px-3 py-1 bg-slate-600 text-white rounded text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                {incident.title}
                <span className={clsx('text-xs px-2 py-0.5 rounded', impactColor(incident.impact))}>{incident.impact}</span>
              </h1>
              <div className="flex items-center gap-3 mt-1 text-sm">
                <span className={clsx('px-2 py-0.5 rounded text-white text-xs capitalize', statusColor(incident.status))}>{incident.status}</span>
                {incident.components && incident.components.length > 0 && (
                  <span className="text-slate-400">Affected: {incident.components.map((c) => c.name).join(', ')}</span>
                )}
              </div>
            </>
          )}
        </div>
        <div className="flex gap-2">
          {incident.status !== 'resolved' && (
            <button onClick={handleResolve} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm"><CheckCircle size={14} /> Resolve</button>
          )}
          <button onClick={() => setEditing(true)} className="flex items-center gap-1 px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm"><Edit size={14} /> Edit</button>
          <button onClick={handleDelete} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm"><Trash2 size={14} /> Delete</button>
        </div>
      </div>

      {/* Add Update */}
      {incident.status !== 'resolved' && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3">
          <h2 className="text-lg font-semibold">Add Update</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)} className={inputCls}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="md:col-span-3">
              <textarea value={updateMessage} onChange={(e) => setUpdateMessage(e.target.value)} placeholder="Update message..." rows={2} className={inputCls} />
            </div>
          </div>
          <button onClick={handleAddUpdate} disabled={submitting || !updateMessage.trim()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm disabled:opacity-50">
            {submitting ? 'Posting...' : 'Post Update'}
          </button>
        </div>
      )}

      {/* Update Timeline */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Timeline</h2>
        {updates.length === 0 ? (
          <div className="text-slate-400 text-sm">No updates yet.</div>
        ) : (
          <div className="space-y-4">
            {updates.map((u) => (
              <div key={u.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={clsx('w-3 h-3 rounded-full mt-1', statusColor(u.status))} />
                  <div className="w-0.5 flex-1 bg-slate-600 mt-1" />
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={clsx('text-xs px-1.5 py-0.5 rounded text-white capitalize', statusColor(u.status))}>{u.status}</span>
                    <span className="text-xs text-slate-400">{new Date(u.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{u.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
