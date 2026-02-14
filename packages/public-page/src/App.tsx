import { useTheme } from './hooks/useTheme';
import { useStatusPage } from './hooks/useStatusPage';
import { calcOverallStatus } from './utils/status';
import { Header } from './components/Header';
import { StatusBanner } from './components/StatusBanner';
import { ComponentList } from './components/ComponentList';
import { ActiveIncidents } from './components/ActiveIncidents';
import { ScheduledMaintenance } from './components/ScheduledMaintenance';
import { IncidentHistory } from './components/IncidentHistory';
import { SubscribeForm } from './components/SubscribeForm';
import { ResponseTimeChart } from './components/ResponseTimeChart';
import { Footer } from './components/Footer';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { theme, toggle } = useTheme();
  const {
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
  } = useStatusPage();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error && !components.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Unable to load status page</p>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  const overall = calcOverallStatus(components);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      <Header name={pageName} logo={logo} theme={theme} onToggleTheme={toggle} />
      <div className="space-y-8 pb-4">
        <StatusBanner status={overall} />
        <ActiveIncidents incidents={incidents} />
        <ScheduledMaintenance windows={maintenance} />
        <ComponentList components={components} uptime={uptime} />
        <ResponseTimeChart metrics={metrics} />
        <SubscribeForm slug={slug} />
        <IncidentHistory incidents={incidents} />
      </div>
      <Footer lastUpdated={lastUpdated} />
    </div>
  );
}
