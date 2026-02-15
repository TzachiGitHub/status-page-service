import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import type {
  StatusComponent,
  ComponentUptime,
  Incident,
  MaintenanceWindow,
  ComponentMetrics,
} from '../types';

function getSlug(): string {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
  // The public page is served under /status/{slug}, so extract the slug after "status/"
  const parts = path.split('/');
  const statusIdx = parts.indexOf('status');
  if (statusIdx >= 0 && parts.length > statusIdx + 1) {
    return parts[statusIdx + 1];
  }
  // Fallback: use the last path segment or 'default'
  return parts[parts.length - 1] || 'default';
}

export function useStatusPage() {
  const slug = getSlug();
  const [pageName, setPageName] = useState('Status');
  const [logo, setLogo] = useState<string | undefined>();
  const [components, setComponents] = useState<StatusComponent[]>([]);
  const [uptime, setUptime] = useState<ComponentUptime[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceWindow[]>([]);
  const [metrics, setMetrics] = useState<ComponentMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [statusRes, uptimeRes, incidentsRes] = await Promise.allSettled([
        axios.get(`/api/public/${slug}/status`),
        axios.get(`/api/public/${slug}/uptime`),
        axios.get(`/api/public/${slug}/incidents`),
      ]);

      if (statusRes.status === 'fulfilled') {
        const d = statusRes.value.data;
        setComponents(d.components || d || []);
        if (d.name) setPageName(d.name);
        if (d.logo) setLogo(d.logo);
        if (d.maintenance) setMaintenance(d.maintenance);
      }
      if (uptimeRes.status === 'fulfilled') {
        setUptime(uptimeRes.value.data.uptime || uptimeRes.value.data || []);
      }
      if (incidentsRes.status === 'fulfilled') {
        setIncidents(incidentsRes.value.data.incidents || incidentsRes.value.data || []);
      }

      // Optional: metrics
      try {
        const metricsRes = await axios.get(`/api/public/${slug}/metrics`);
        setMetrics(metricsRes.data.metrics || metricsRes.data || []);
      } catch {
        // metrics endpoint may not exist
      }

      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError('Failed to load status data');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  // Fetch data first, then connect SSE to avoid race condition
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      await fetchAll();
      if (cancelled) return;

      const es = new EventSource(`/api/public/${slug}/sse`);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'component_update' && data.component) {
            setComponents((prev) =>
              prev.map((c) => (c.id === data.component.id ? { ...c, ...data.component } : c))
            );
          }
          if (data.type === 'incident_update' && data.incident) {
            setIncidents((prev) => {
              const idx = prev.findIndex((i) => i.id === data.incident.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = data.incident;
                return next;
              }
              return [data.incident, ...prev];
            });
          }
          setLastUpdated(new Date());
        } catch {
          // ignore parse errors
        }
      };

      es.onerror = () => {
        // will auto-reconnect
      };
    };

    init();

    return () => {
      cancelled = true;
      eventSourceRef.current?.close();
    };
  }, [slug, fetchAll]);

  return {
    slug,
    pageName,
    logo,
    components,
    uptime,
    incidents,
    maintenance,
    metrics,
    loading,
    error,
    lastUpdated,
    refetch: fetchAll,
  };
}
