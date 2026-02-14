import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useDarkModeStore } from '../stores/darkModeStore';
import {
  LayoutDashboard,
  Monitor,
  Layers,
  AlertTriangle,
  Users,
  Bell,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/monitors', icon: Monitor, label: 'Monitors' },
  { to: '/components', icon: Layers, label: 'Components' },
  { to: '/incidents', icon: AlertTriangle, label: 'Incidents' },
  { to: '/subscribers', icon: Users, label: 'Subscribers' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { dark, toggle } = useDarkModeStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebar = (
    <nav className="flex flex-col h-full">
      <div className="p-4 text-xl font-bold border-b border-slate-700">Status Page</div>
      <div className="flex-1 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              )
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </div>
      <div className="border-t border-slate-700 p-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white w-full rounded"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 bg-slate-800 flex-col flex-shrink-0">{sidebar}</aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-60 h-full bg-slate-800">{sidebar}</aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 flex items-center justify-between px-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <button className="md:hidden" onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="text-lg font-semibold hidden md:block">Dashboard</div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
