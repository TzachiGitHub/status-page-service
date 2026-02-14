import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import clsx from 'clsx';
import type { OverallStatus } from '../types';

const CONFIG: Record<OverallStatus, { label: string; icon: typeof CheckCircle; bg: string }> = {
  operational: {
    label: 'All Systems Operational',
    icon: CheckCircle,
    bg: 'bg-emerald-500',
  },
  partial: {
    label: 'Partial System Outage',
    icon: AlertTriangle,
    bg: 'bg-amber-500',
  },
  major: {
    label: 'Major System Outage',
    icon: XCircle,
    bg: 'bg-red-500',
  },
};

export function StatusBanner({ status }: { status: OverallStatus }) {
  const { label, icon: Icon, bg } = CONFIG[status];
  return (
    <div className={clsx('rounded-lg p-4 sm:p-6 text-white font-semibold text-lg sm:text-xl flex items-center gap-3', bg)}>
      <Icon className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" />
      <span>{label}</span>
    </div>
  );
}
