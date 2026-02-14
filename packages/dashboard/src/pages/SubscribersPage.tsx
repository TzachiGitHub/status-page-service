import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import api from '../lib/api';

interface Subscriber {
  id: string;
  email: string;
  confirmed: boolean;
  components?: { id: string; name: string }[];
  createdAt: string;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/subscribers').then((r) => {
      const d = r.data;
      setSubscribers(Array.isArray(d) ? d : d.subscribers || d.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this subscriber?')) return;
    await api.delete(`/subscribers/${id}`);
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
  };

  if (loading) return <div className="text-center py-8 text-slate-400">Loading...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Subscribers</h1>
      {subscribers.length === 0 ? (
        <div className="text-center py-8 text-slate-400">No subscribers yet.</div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 hidden md:table-cell">Components</th>
                <th className="px-4 py-3 hidden md:table-cell">Subscribed</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.id} className="border-b border-slate-200 dark:border-slate-700">
                  <td className="px-4 py-3 font-medium">{s.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${s.confirmed ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}`}>
                      {s.confirmed ? 'Confirmed' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-slate-400 text-xs">
                    {s.components?.map((c) => c.name).join(', ') || 'All'}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(s.id)} className="p-1 hover:bg-slate-700 rounded text-red-400"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
