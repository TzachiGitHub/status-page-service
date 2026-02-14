import { create } from 'zustand';
import api from '../lib/api';

export interface Monitor {
  id: string;
  name: string;
  type: string;
  status: string;
  url?: string;
  host?: string;
  port?: number;
  interval: number;
  uptimePercent?: number;
  avgResponseTime?: number;
  lastCheckedAt?: string;
  config?: Record<string, unknown>;
  componentId?: string;
  alertAfter?: number;
  recoverAfter?: number;
  regions?: string[];
  heartbeatUrl?: string;
}

interface MonitorState {
  monitors: Monitor[];
  loading: boolean;
  fetchMonitors: () => Promise<void>;
  createMonitor: (data: Partial<Monitor>) => Promise<Monitor>;
  updateMonitor: (id: string, data: Partial<Monitor>) => Promise<void>;
  deleteMonitor: (id: string) => Promise<void>;
  pauseMonitor: (id: string) => Promise<void>;
  resumeMonitor: (id: string) => Promise<void>;
}

export const useMonitorStore = create<MonitorState>((set, get) => ({
  monitors: [],
  loading: false,
  fetchMonitors: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/monitors');
      set({ monitors: Array.isArray(data) ? data : data.monitors || data.data || [] });
    } finally {
      set({ loading: false });
    }
  },
  createMonitor: async (d) => {
    const { data } = await api.post('/monitors', d);
    const monitor = data.monitor || data;
    set({ monitors: [...get().monitors, monitor] });
    return monitor;
  },
  updateMonitor: async (id, d) => {
    const { data } = await api.patch(`/monitors/${id}`, d);
    const updated = data.monitor || data;
    set({ monitors: get().monitors.map((m) => (m.id === id ? { ...m, ...updated } : m)) });
  },
  deleteMonitor: async (id) => {
    await api.delete(`/monitors/${id}`);
    set({ monitors: get().monitors.filter((m) => m.id !== id) });
  },
  pauseMonitor: async (id) => {
    await api.post(`/monitors/${id}/pause`);
    set({ monitors: get().monitors.map((m) => (m.id === id ? { ...m, status: 'PAUSED' } : m)) });
  },
  resumeMonitor: async (id) => {
    await api.post(`/monitors/${id}/resume`);
    set({ monitors: get().monitors.map((m) => (m.id === id ? { ...m, status: 'UP' } : m)) });
  },
}));
