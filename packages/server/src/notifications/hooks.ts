import { sseManager } from '../sse/manager.js';
import { dispatchNotification } from './dispatcher.js';

export async function onMonitorStatusChange(monitor: any, check: any, alert: any): Promise<void> {
  sseManager.broadcastAll(monitor.orgId, {
    type: 'monitor.status',
    data: { monitor, check },
  });

  if (alert) {
    await dispatchNotification(monitor.orgId, {
      type: alert.type === 'DOWN' ? 'monitor.down' : 'monitor.recovery',
      data: { monitor, check, alert },
    });
  }
}

export async function onIncidentChange(orgId: string, incident: any, update?: any): Promise<void> {
  sseManager.broadcastAll(orgId, {
    type: 'incident.updated',
    data: { incident, update },
  });

  await dispatchNotification(orgId, {
    type: update ? 'incident.updated' : 'incident.created',
    data: { incident, update },
  });
}

export async function onComponentChange(orgId: string, component: any): Promise<void> {
  sseManager.broadcastAll(orgId, {
    type: 'component.status',
    data: component,
  });
}
