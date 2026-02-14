import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import type { StatusComponent } from '../types';
import { STATUS_CONFIG, groupComponents } from '../utils/status';
import { UptimeBars } from './UptimeBars';
import type { ComponentUptime } from '../types';

function ComponentRow({ component, uptimeData }: { component: StatusComponent; uptimeData?: ComponentUptime }) {
  const cfg = STATUS_CONFIG[component.status];
  return (
    <div className="py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <span className="text-sm sm:text-base font-medium">{component.name}</span>
        <span className="flex items-center gap-2 text-xs sm:text-sm">
          <span className={clsx('w-2.5 h-2.5 rounded-full', cfg.dotClass)} />
          <span className="hidden sm:inline" style={{ color: cfg.color }}>{cfg.label}</span>
        </span>
      </div>
      {uptimeData && <UptimeBars data={uptimeData} />}
    </div>
  );
}

function Group({
  name,
  components,
  uptimeMap,
}: {
  name: string;
  components: StatusComponent[];
  uptimeMap: Map<string, ComponentUptime>;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
      >
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <span className="font-semibold text-sm">{name}</span>
      </button>
      {open && (
        <div className="divide-y divide-slate-100 dark:divide-slate-800 px-4">
          {components.map((c) => (
            <ComponentRow key={c.id} component={c} uptimeData={uptimeMap.get(c.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ComponentList({
  components,
  uptime,
}: {
  components: StatusComponent[];
  uptime: ComponentUptime[];
}) {
  const uptimeMap = new Map(uptime.map((u) => [u.componentId, u]));
  const { groups, ungrouped } = groupComponents(components);

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([name, comps]) => (
        <Group key={name} name={name} components={comps} uptimeMap={uptimeMap} />
      ))}
      {ungrouped.length > 0 && (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg divide-y divide-slate-100 dark:divide-slate-800 px-4">
          {ungrouped.map((c) => (
            <ComponentRow key={c.id} component={c} uptimeData={uptimeMap.get(c.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
