import { useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import axios from 'axios';

export function SubscribeForm({ slug }: { slug: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      await axios.post(`/api/subscribers/${slug}/subscribe`, { email });
      setStatus('success');
      setMessage('Subscribed! You will receive status updates.');
      setEmail('');
      setTimeout(() => setStatus('idle'), 5000);
    } catch {
      setStatus('error');
      setMessage('Failed to subscribe. Please try again.');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <section>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Bell className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe to Updates'}
        </button>
      </form>
      {status === 'success' && (
        <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
          <Check className="w-4 h-4" /> {message}
        </div>
      )}
      {status === 'error' && (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <X className="w-4 h-4" /> {message}
        </div>
      )}
    </section>
  );
}
