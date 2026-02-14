import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit, ChevronDown, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import api from '../lib/api';
import clsx from 'clsx';

interface Component {
  id: string;
  name: string;
  description?: string;
  status: string;
  order?: number;
  groupId?: string;
}

interface ComponentGroup {
  id: string;
  name: string;
  order?: number;
  components?: Component[];
}

const STATUSES = ['operational', 'degraded', 'partial_outage', 'major_outage', 'maintenance'];
const STATUS_LABELS: Record<string, string> = {
  operational: 'Operational',
  degraded: 'Degraded',
  partial_outage: 'Partial Outage',
  major_outage: 'Major Outage',
  maintenance: 'Maintenance',
};
const STATUS_COLORS: Record<string, string> = {
  operational: 'text-green-400',
  degraded: 'text-yellow-400',
  partial_outage: 'text-orange-400',
  major_outage: 'text-red-400',
  maintenance: 'text-blue-400',
};

export default function ComponentsPage() {
  const [components, setComponents] = useState<Component[]>([]);
  const [groups, setGroups] = useState<ComponentGroup[]>([]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState<'component' | 'group' | null>(null);
  const [editItem, setEditItem] = useState<Component | ComponentGroup | null>(null);
  const [editType, setEditType] = useState<'component' | 'group'>('component');
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState('operational');
  const [formGroupId, setFormGroupId] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [cRes, gRes] = await Promise.allSettled([
        api.get('/components'),
        api.get('/component-groups'),
      ]);
      if (cRes.status === 'fulfilled') {
        const d = cRes.value.data;
        setComponents(Array.isArray(d) ? d : d.components || d.data || []);
      }
      if (gRes.status === 'fulfilled') {
        const d = gRes.value.data;
        setGroups(Array.isArray(d) ? d : d.groups || d.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openCreate = (type: 'component' | 'group') => {
    setEditItem(null);
    setEditType(type);
    setFormName('');
    setFormDesc('');
    setFormStatus('operational');
    setFormGroupId('');
    setShowForm(type);
  };

  const openEdit = (item: Component | ComponentGroup, type: 'component' | 'group') => {
    setEditItem(item);
    setEditType(type);
    setFormName(item.name);
    setFormDesc((item as Component).description || '');
    setFormStatus((item as Component).status || 'operational');
    setFormGroupId((item as Component).groupId || '');
    setShowForm(type);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editType === 'component') {
        const payload = { name: formName, description: formDesc, status: formStatus, groupId: formGroupId || undefined };
        if (editItem) {
          await api.patch(`/components/${editItem.id}`, payload);
        } else {
          await api.post('/components', payload);
        }
      } else {
        const payload = { name: formName };
        if (editItem) {
          await api.patch(`/component-groups/${editItem.id}`, payload);
        } else {
          await api.post('/component-groups', payload);
        }
      }
      setShowForm(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, type: 'component' | 'group') => {
    if (!confirm(`Delete this ${type}?`)) return;
    await api.delete(`/${type === 'component' ? 'components' : 'component-groups'}/${id}`);
    await load();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await api.patch(`/components/${id}`, { status });
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  const moveComponent = async (id: string, direction: 'up' | 'down') => {
    const idx = components.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const newOrder = direction === 'up' ? (components[idx].order || idx) - 1 : (components[idx].order || idx) + 1;
    await api.patch(`/components/${id}`, { order: newOrder });
    await load();
  };

  const ungrouped = components.filter((c) => !c.groupId);
  const inputCls = 'w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

  if (loading) return <div className="text-center py-8 text-slate-400">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Components</h1>
        <div className="flex gap-2">
          <button onClick={() => openCreate('group')} className="px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm"><Plus size={14} className="inline mr-1" />New Group</button>
          <button onClick={() => openCreate('component')} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm"><Plus size={14} className="inline mr-1" />New Component</button>
        </div>
      </div>

      {/* Groups */}
      {groups.map((g) => {
        const groupComps = components.filter((c) => c.groupId === g.id);
        const isCollapsed = collapsed.has(g.id);
        return (
          <div key={g.id} className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 cursor-pointer" onClick={() => toggleCollapse(g.id)}>
              <div className="flex items-center gap-2">
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                <span className="font-semibold">{g.name}</span>
                <span className="text-xs text-slate-400">({groupComps.length})</span>
              </div>
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => openEdit(g, 'group')} className="p-1 hover:bg-slate-700 rounded"><Edit size={14} /></button>
                <button onClick={() => handleDelete(g.id, 'group')} className="p-1 hover:bg-slate-700 rounded text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
            {!isCollapsed && (
              <div>
                {groupComps.length === 0 ? (
                  <div className="px-4 py-3 text-slate-400 text-sm">No components in this group</div>
                ) : (
                  groupComps.map((c) => <ComponentRow key={c.id} component={c} onEdit={() => openEdit(c, 'component')} onDelete={() => handleDelete(c.id, 'component')} onStatusChange={handleStatusChange} onMove={moveComponent} />)
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Ungrouped */}
      {ungrouped.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-semibold">Ungrouped</div>
          {ungrouped.map((c) => <ComponentRow key={c.id} component={c} onEdit={() => openEdit(c, 'component')} onDelete={() => handleDelete(c.id, 'component')} onStatusChange={handleStatusChange} onMove={moveComponent} />)}
        </div>
      )}

      {components.length === 0 && groups.length === 0 && (
        <div className="text-center py-8 text-slate-400">No components yet. Create one to get started.</div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(null)}>
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">{editItem ? 'Edit' : 'Create'} {editType === 'component' ? 'Component' : 'Group'}</h2>
            <div><label className="block text-xs text-slate-400 mb-1">Name</label><input value={formName} onChange={(e) => setFormName(e.target.value)} className={inputCls} /></div>
            {editType === 'component' && (
              <>
                <div><label className="block text-xs text-slate-400 mb-1">Description</label><input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className={inputCls} /></div>
                <div><label className="block text-xs text-slate-400 mb-1">Status</label>
                  <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} className={inputCls}>
                    {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs text-slate-400 mb-1">Group</label>
                  <select value={formGroupId} onChange={(e) => setFormGroupId(e.target.value)} className={inputCls}>
                    <option value="">None</option>
                    {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
              </>
            )}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(null)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving || !formName} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ComponentRow({ component: c, onEdit, onDelete, onStatusChange, onMove }: {
  component: Component;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (id: string, status: string) => void;
  onMove: (id: string, dir: 'up' | 'down') => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 last:border-0">
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-0.5">
          <button onClick={() => onMove(c.id, 'up')} className="p-0.5 hover:bg-slate-700 rounded"><ArrowUp size={12} /></button>
          <button onClick={() => onMove(c.id, 'down')} className="p-0.5 hover:bg-slate-700 rounded"><ArrowDown size={12} /></button>
        </div>
        <div>
          <div className="font-medium text-sm">{c.name}</div>
          {c.description && <div className="text-xs text-slate-400">{c.description}</div>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={c.status}
          onChange={(e) => onStatusChange(c.id, e.target.value)}
          className={clsx('text-xs px-2 py-1 rounded bg-slate-700 border-0 focus:ring-2 focus:ring-indigo-500', STATUS_COLORS[c.status])}
        >
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <button onClick={onEdit} className="p-1 hover:bg-slate-700 rounded"><Edit size={14} /></button>
        <button onClick={onDelete} className="p-1 hover:bg-slate-700 rounded text-red-400"><Trash2 size={14} /></button>
      </div>
    </div>
  );
}
