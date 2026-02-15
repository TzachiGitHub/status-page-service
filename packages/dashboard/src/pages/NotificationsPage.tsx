import { useEffect, useState } from 'react';
import { Plus, Trash2, Send } from 'lucide-react';
import api from '../lib/api';
import ConfirmDialog from '../components/ConfirmDialog';
import { useConfirm } from '../hooks/useConfirm';
import clsx from 'clsx';

interface Channel {
  id: string;
  name: string;
  type: string;
  config?: Record<string, unknown>;
}

const TYPES = ['email', 'webhook', 'slack'];

export default function NotificationsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('email');
  const [formConfig, setFormConfig] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { confirmState, confirm, cancelConfirm } = useConfirm();

  const load = async () => {
    try {
      const { data } = await api.get('/notification-channels');
      const arr = Array.isArray(data) ? data : data.channels || data.data || [];
      setChannels(arr);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await api.post('/notification-channels', { name: formName, type: formType, config: formConfig });
      setShowCreate(false);
      setFormName('');
      setFormConfig({});
      await load();
    } catch (err: unknown) {
      alert((err as any)?.response?.data?.error || 'Failed to create channel');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleTest = async (id: string) => {
    setTesting(id);
    try {
      await api.post(`/notification-channels/${id}/test`);
      showToast('Test notification sent!', 'success');
    } catch {
      showToast('Test failed', 'error');
    } finally {
      setTesting(null);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({ title: 'Delete Channel', message: 'Are you sure you want to delete this notification channel?', confirmLabel: 'Delete', variant: 'danger' });
    if (!ok) return;
    try {
      await api.delete(`/notification-channels/${id}`);
      setChannels((prev) => prev.filter((c) => c.id !== id));
    } catch (err: unknown) {
      alert((err as any)?.response?.data?.error || 'Failed to delete channel');
    }
  };

  const configFields = (type: string) => {
    switch (type) {
      case 'email': return [{ key: 'recipients', label: 'Recipients (comma separated)', placeholder: 'a@b.com, c@d.com' }];
      case 'webhook': return [{ key: 'url', label: 'Webhook URL', placeholder: 'https://...' }];
      case 'slack': return [
        { key: 'webhookUrl', label: 'Slack Webhook URL', placeholder: 'https://hooks.slack.com/...' },
        { key: 'channel', label: 'Channel', placeholder: '#alerts' },
      ];
      default: return [];
    }
  };

  const configSummary = (ch: Channel) => {
    const c = ch.config || {};
    if (ch.type === 'email') return (c.recipients as string) || '';
    if (ch.type === 'webhook') return (c.url as string) || '';
    if (ch.type === 'slack') return (c.channel as string) || (c.webhookUrl as string)?.slice(0, 30) + '...' || '';
    return '';
  };

  const inputCls = 'w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

  if (loading) return <div className="text-center py-8 text-slate-400">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notification Channels</h1>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm">
          <Plus size={16} /> Add Channel
        </button>
      </div>

      {channels.length === 0 ? (
        <div className="text-center py-8 text-slate-400">No notification channels configured.</div>
      ) : (
        <div className="space-y-2">
          {channels.map((ch) => (
            <div key={ch.id} className="bg-white dark:bg-slate-800 rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{ch.name}</span>
                  <span className={clsx('text-xs px-2 py-0.5 rounded text-white', ch.type === 'email' ? 'bg-blue-600' : ch.type === 'webhook' ? 'bg-purple-600' : 'bg-green-600')}>{ch.type}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">{configSummary(ch)}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleTest(ch.id)} disabled={testing === ch.id} className="flex items-center gap-1 px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm disabled:opacity-50">
                  <Send size={14} /> {testing === ch.id ? 'Testing...' : 'Test'}
                </button>
                <button onClick={() => handleDelete(ch.id)} className="p-1.5 hover:bg-slate-700 rounded text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreate(false)}>
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">New Notification Channel</h2>
            <div><label className="block text-xs text-slate-400 mb-1">Name</label><input value={formName} onChange={(e) => setFormName(e.target.value)} className={inputCls} /></div>
            <div><label className="block text-xs text-slate-400 mb-1">Type</label>
              <div className="flex gap-2">
                {TYPES.map((t) => (
                  <button key={t} type="button" onClick={() => { setFormType(t); setFormConfig({}); }}
                    className={clsx('px-3 py-1 rounded text-xs capitalize', formType === t ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300')}
                  >{t}</button>
                ))}
              </div>
            </div>
            {configFields(formType).map((f) => (
              <div key={f.key}>
                <label className="block text-xs text-slate-400 mb-1">{f.label}</label>
                <input value={formConfig[f.key] || ''} onChange={(e) => setFormConfig({ ...formConfig, [f.key]: e.target.value })} placeholder={f.placeholder} className={inputCls} />
              </div>
            ))}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !formName} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm disabled:opacity-50">{saving ? 'Creating...' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog {...confirmState} onCancel={cancelConfirm} />
      {toast && (
        <div className={`fixed bottom-4 right-4 z-[100] px-4 py-2 rounded shadow-lg text-sm text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
