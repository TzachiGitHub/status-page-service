import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../lib/api';
import type { Monitor } from '../stores/monitorStore';

const TYPES = ['HTTP', 'TCP', 'PING', 'SSL', 'HEARTBEAT', 'DNS'] as const;
const INTERVALS = [
  { label: '30s', value: 30 },
  { label: '1m', value: 60 },
  { label: '2m', value: 120 },
  { label: '5m', value: 300 },
  { label: '10m', value: 600 },
];
const REGIONS = ['us-east', 'us-west', 'eu-west', 'eu-central', 'ap-southeast', 'ap-northeast'];
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

interface Props {
  monitor?: Monitor | null;
  onClose: () => void;
  onSaved: (m: Monitor) => void;
}

export default function MonitorModal({ monitor, onClose, onSaved }: Props) {
  const isEdit = !!monitor;
  const [type, setType] = useState(monitor?.type || 'HTTP');
  const [name, setName] = useState(monitor?.name || '');
  const [url, setUrl] = useState(monitor?.url || monitor?.config?.url as string || '');
  const [method, setMethod] = useState((monitor?.config?.method as string) || 'GET');
  const [expectedStatus, setExpectedStatus] = useState<string>((monitor?.config?.expectedStatus as string) || '200');
  const [keyword, setKeyword] = useState((monitor?.config?.keyword as string) || '');
  const [headers, setHeaders] = useState((monitor?.config?.headers as string) || '');
  const [host, setHost] = useState(monitor?.host || monitor?.config?.host as string || '');
  const [port, setPort] = useState<string>(String(monitor?.port || monitor?.config?.port || ''));
  const [expiryThreshold, setExpiryThreshold] = useState<string>(String(monitor?.config?.expiryThreshold || '30'));
  const [hostname, setHostname] = useState((monitor?.config?.hostname as string) || '');
  const [expectedIp, setExpectedIp] = useState((monitor?.config?.expectedIp as string) || '');
  const [checkInterval, setCheckInterval] = useState(monitor?.interval || 60);
  const [regions, setRegions] = useState<string[]>(monitor?.regions || []);
  const [alertAfter, setAlertAfter] = useState<string>(String(monitor?.alertAfter || '3'));
  const [recoverAfter, setRecoverAfter] = useState<string>(String(monitor?.recoverAfter || '2'));
  const [componentId, setComponentId] = useState(monitor?.componentId || '');
  const [components, setComponents] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/components').then((r) => {
      const d = r.data;
      setComponents(Array.isArray(d) ? d : d.components || d.data || []);
    }).catch(() => {});
  }, []);

  const toggleRegion = (r: string) => {
    setRegions((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const config: Record<string, unknown> = {};
      if (type === 'HTTP') {
        let parsedHeaders: Record<string, string> | undefined;
        if (headers) {
          try {
            parsedHeaders = JSON.parse(headers);
          } catch {
            setError('Invalid JSON in Headers field');
            setSaving(false);
            return;
          }
        }
        Object.assign(config, { url, method, expectedStatus: Number(expectedStatus), keyword, headers: parsedHeaders });
      } else if (type === 'TCP') {
        Object.assign(config, { host, port: Number(port) });
      } else if (type === 'PING') {
        Object.assign(config, { host });
      } else if (type === 'SSL') {
        Object.assign(config, { host, expiryThreshold: Number(expiryThreshold) });
      } else if (type === 'DNS') {
        Object.assign(config, { hostname, expectedIp });
      }
      const payload = {
        name,
        type,
        url: type === 'HTTP' ? url : undefined,
        host: ['TCP', 'PING', 'SSL'].includes(type) ? host : undefined,
        port: type === 'TCP' ? Number(port) : undefined,
        interval: checkInterval,
        regions,
        alertAfter: Number(alertAfter),
        recoverAfter: Number(recoverAfter),
        componentId: componentId || undefined,
        config,
      };
      let result: Monitor;
      if (isEdit) {
        const { data } = await api.patch(`/monitors/${monitor!.id}`, payload);
        result = data.monitor || data;
      } else {
        const { data } = await api.post('/monitors', payload);
        result = data.monitor || data;
      }
      onSaved(result);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
  const labelCls = 'block text-xs text-slate-400 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold">{isEdit ? 'Edit Monitor' : 'New Monitor'}</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && <div className="text-red-400 text-sm bg-red-900/30 p-2 rounded">{error}</div>}

          <div>
            <label className={labelCls}>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Type</label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`px-3 py-1 rounded text-xs font-medium ${type === t ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >{t}</button>
              ))}
            </div>
          </div>

          {/* Dynamic fields */}
          {type === 'HTTP' && (
            <>
              <div><label className={labelCls}>URL</label><input value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="https://example.com" className={inputCls} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Method</label>
                  <select value={method} onChange={(e) => setMethod(e.target.value)} className={inputCls}>
                    {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div><label className={labelCls}>Expected Status</label><input value={expectedStatus} onChange={(e) => setExpectedStatus(e.target.value)} className={inputCls} /></div>
              </div>
              <div><label className={labelCls}>Keyword (optional)</label><input value={keyword} onChange={(e) => setKeyword(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Headers (JSON, optional)</label><input value={headers} onChange={(e) => setHeaders(e.target.value)} placeholder='{"Authorization":"Bearer ..."}' className={inputCls} /></div>
            </>
          )}
          {type === 'TCP' && (
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Host</label><input value={host} onChange={(e) => setHost(e.target.value)} required className={inputCls} /></div>
              <div><label className={labelCls}>Port</label><input value={port} onChange={(e) => setPort(e.target.value)} required type="number" className={inputCls} /></div>
            </div>
          )}
          {type === 'PING' && (
            <div><label className={labelCls}>Host</label><input value={host} onChange={(e) => setHost(e.target.value)} required className={inputCls} /></div>
          )}
          {type === 'SSL' && (
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Host</label><input value={host} onChange={(e) => setHost(e.target.value)} required className={inputCls} /></div>
              <div><label className={labelCls}>Expiry Threshold (days)</label><input value={expiryThreshold} onChange={(e) => setExpiryThreshold(e.target.value)} type="number" className={inputCls} /></div>
            </div>
          )}
          {type === 'HEARTBEAT' && (
            <div className="text-sm text-slate-400 bg-slate-700 p-3 rounded">
              {isEdit && monitor?.heartbeatUrl
                ? <>Heartbeat URL: <code className="text-indigo-400 break-all">{monitor.heartbeatUrl}</code></>
                : 'A heartbeat URL will be generated after creation.'}
            </div>
          )}
          {type === 'DNS' && (
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Hostname</label><input value={hostname} onChange={(e) => setHostname(e.target.value)} required className={inputCls} /></div>
              <div><label className={labelCls}>Expected IP</label><input value={expectedIp} onChange={(e) => setExpectedIp(e.target.value)} className={inputCls} /></div>
            </div>
          )}

          <div>
            <label className={labelCls}>Check Interval</label>
            <div className="flex gap-2">
              {INTERVALS.map((i) => (
                <button key={i.value} type="button" onClick={() => setCheckInterval(i.value)}
                  className={`px-3 py-1 rounded text-xs font-medium ${checkInterval === i.value ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >{i.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Regions</label>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((r) => (
                <button key={r} type="button" onClick={() => toggleRegion(r)}
                  className={`px-2 py-1 rounded text-xs ${regions.includes(r) ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >{r}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Alert after N failures</label><input value={alertAfter} onChange={(e) => setAlertAfter(e.target.value)} type="number" min="1" className={inputCls} /></div>
            <div><label className={labelCls}>Recover after N successes</label><input value={recoverAfter} onChange={(e) => setRecoverAfter(e.target.value)} type="number" min="1" className={inputCls} /></div>
          </div>

          <div>
            <label className={labelCls}>Link to Component (optional)</label>
            <select value={componentId} onChange={(e) => setComponentId(e.target.value)} className={inputCls}>
              <option value="">None</option>
              {components.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <button type="submit" disabled={saving} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium disabled:opacity-50">
            {saving ? 'Saving...' : isEdit ? 'Update Monitor' : 'Create Monitor'}
          </button>
        </form>
      </div>
    </div>
  );
}
