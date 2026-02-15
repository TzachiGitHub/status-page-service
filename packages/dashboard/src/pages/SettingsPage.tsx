import { useEffect, useState } from 'react';
import { Save, Plus, Trash2, Copy } from 'lucide-react';
import { useDarkModeStore } from '../stores/darkModeStore';
import api from '../lib/api';
import ConfirmDialog from '../components/ConfirmDialog';
import { useConfirm } from '../hooks/useConfirm';

interface ApiKey {
  id: string;
  name: string;
  key?: string;
  createdAt: string;
}

interface StatusPageConfig {
  title?: string;
  description?: string;
  showSubscribe?: boolean;
  showUptime?: boolean;
  showResponseTime?: boolean;
  showIncidentHistory?: boolean;
  historyDays?: number;
  customDomain?: string;
}

export default function SettingsPage() {
  const { dark, toggle } = useDarkModeStore();
  const [config, setConfig] = useState<StatusPageConfig>({
    title: '',
    description: '',
    showSubscribe: true,
    showUptime: true,
    showResponseTime: true,
    showIncidentHistory: true,
    historyDays: 90,
    customDomain: '',
  });
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [keyError, setKeyError] = useState<string | null>(null);
  const { confirmState, confirm, cancelConfirm } = useConfirm();

  useEffect(() => {
    api.get('/settings').then((r) => {
      const d = r.data.settings || r.data;
      setConfig((prev) => ({ ...prev, ...d }));
    }).catch(() => {});

    api.get('/api-keys').then((r) => {
      const d = r.data;
      setApiKeys(Array.isArray(d) ? d : d.keys || d.data || []);
    }).catch(() => {}).finally(() => setLoadingKeys(false));
  }, []);

  const handleSave = async (fields?: Partial<StatusPageConfig>) => {
    setSaving(true);
    setSaved(false);
    try {
      await api.patch('/settings', fields || config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: unknown) {
      alert((err as any)?.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    try {
      const { data } = await api.post('/api-keys', { name: newKeyName });
      const key = data.apiKey || data;
      setApiKeys((prev) => [...prev, key]);
      if (key.key) setNewKey(key.key);
      setNewKeyName('');
    } catch {
      setKeyError('Failed to create API key');
      setTimeout(() => setKeyError(null), 3000);
    }
  };

  const handleRevokeKey = async (id: string) => {
    const ok = await confirm({ title: 'Revoke API Key', message: 'Are you sure you want to revoke this API key? This action cannot be undone.', confirmLabel: 'Revoke', variant: 'danger' });
    if (!ok) return;
    try {
      await api.delete(`/api-keys/${id}`);
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (err: unknown) {
      alert((err as any)?.response?.data?.error || 'Failed to revoke API key');
    }
  };

  const inputCls = 'w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Status Page Config */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">Status Page Configuration</h2>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Page Title</label>
          <input value={config.title || ''} onChange={(e) => setConfig({ ...config, title: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Description</label>
          <textarea value={config.description || ''} onChange={(e) => setConfig({ ...config, description: e.target.value })} rows={2} className={inputCls} />
        </div>
        <div className="space-y-2">
          <Toggle label="Show subscribe button" checked={!!config.showSubscribe} onChange={(v) => setConfig({ ...config, showSubscribe: v })} />
          <Toggle label="Show uptime" checked={!!config.showUptime} onChange={(v) => setConfig({ ...config, showUptime: v })} />
          <Toggle label="Show response time" checked={!!config.showResponseTime} onChange={(v) => setConfig({ ...config, showResponseTime: v })} />
          <Toggle label="Show incident history" checked={!!config.showIncidentHistory} onChange={(v) => setConfig({ ...config, showIncidentHistory: v })} />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">History Days: {config.historyDays}</label>
          <input type="range" min="7" max="365" value={config.historyDays || 90} onChange={(e) => setConfig({ ...config, historyDays: Number(e.target.value) })} className="w-full" />
        </div>
        <button onClick={() => handleSave()} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm disabled:opacity-50">
          <Save size={14} /> {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Settings'}
        </button>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">Appearance</h2>
        <Toggle label="Dark mode" checked={dark} onChange={toggle} />
      </div>

      {/* Custom Domain */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 space-y-3">
        <h2 className="text-lg font-semibold">Custom Domain</h2>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Custom Domain</label>
          <input value={config.customDomain || ''} onChange={(e) => setConfig({ ...config, customDomain: e.target.value })} placeholder="status.yourdomain.com" className={inputCls} />
        </div>
        <div className="text-sm text-slate-400 bg-slate-700/50 p-3 rounded">
          <p className="font-medium text-slate-300 mb-1">CNAME Setup:</p>
          <p>Create a CNAME record pointing your custom domain to your status page host:</p>
          <code className="block mt-1 text-indigo-400">{config.customDomain || 'status.yourdomain.com'} CNAME {window.location.hostname}</code>
        </div>
        <button onClick={() => handleSave({ customDomain: config.customDomain })} disabled={saving} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm disabled:opacity-50">
          <Save size={14} className="inline mr-1" /> Save Domain
        </button>
      </div>

      {/* API Keys */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">API Keys</h2>
        {newKey && (
          <div className="bg-green-900/30 border border-green-600 rounded p-3 text-sm">
            <p className="text-green-400 font-medium mb-1">New API key created! Copy it now — it won't be shown again.</p>
            <div className="flex items-center gap-2">
              <code className="text-green-300 flex-1 break-all">{newKey}</code>
              <button onClick={() => { navigator.clipboard.writeText(newKey); }} className="p-1 hover:bg-slate-700 rounded"><Copy size={14} /></button>
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="Key name" className={inputCls} />
          <button onClick={handleCreateKey} className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm whitespace-nowrap">
            <Plus size={14} /> Create
          </button>
        </div>
        {loadingKeys ? (
          <div className="text-slate-400 text-sm">Loading...</div>
        ) : apiKeys.length === 0 ? (
          <div className="text-slate-400 text-sm">No API keys.</div>
        ) : (
          <div className="space-y-2">
            {apiKeys.map((k) => (
              <div key={k.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                <div>
                  <span className="font-medium text-sm">{k.name}</span>
                  <span className="text-xs text-slate-400 ml-2">{new Date(k.createdAt).toLocaleDateString()}</span>
                </div>
                <button onClick={() => handleRevokeKey(k.id)} className="flex items-center gap-1 px-2 py-1 text-red-400 hover:bg-slate-700 rounded text-xs">
                  <Trash2 size={12} /> Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmDialog {...confirmState} onCancel={cancelConfirm} />
      {keyError && (
        <div className="fixed bottom-4 right-4 z-[100] px-4 py-2 rounded shadow-lg text-sm text-white bg-red-600">
          {keyError}
        </div>
      )}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm">{label}</span>
      <div className="relative">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
        <div className={`w-10 h-5 rounded-full transition ${checked ? 'bg-indigo-600' : 'bg-slate-600'}`}>
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </div>
      </div>
    </label>
  );
}
