import type { Response } from 'express';

export interface SSEEvent {
  type: string;
  data: any;
}

type ConnectionType = 'dashboard' | 'public';

function key(orgId: string, type: ConnectionType): string {
  return `${orgId}:${type}`;
}

export class SSEManager {
  private connections = new Map<string, Set<Response>>();

  addConnection(orgId: string, type: ConnectionType, res: Response): void {
    const k = key(orgId, type);
    if (!this.connections.has(k)) {
      this.connections.set(k, new Set());
    }
    this.connections.get(k)!.add(res);
  }

  removeConnection(orgId: string, type: ConnectionType, res: Response): void {
    const k = key(orgId, type);
    const set = this.connections.get(k);
    if (set) {
      set.delete(res);
      if (set.size === 0) this.connections.delete(k);
    }
  }

  broadcast(orgId: string, type: ConnectionType, event: SSEEvent): void {
    const k = key(orgId, type);
    const set = this.connections.get(k);
    if (!set) return;
    const payload = `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;
    for (const res of set) {
      try {
        res.write(payload);
      } catch {
        set.delete(res);
      }
    }
  }

  broadcastAll(orgId: string, event: SSEEvent): void {
    this.broadcast(orgId, 'dashboard', event);
    this.broadcast(orgId, 'public', event);
  }

  getConnectionCount(orgId: string): number {
    let count = 0;
    for (const type of ['dashboard', 'public'] as ConnectionType[]) {
      const set = this.connections.get(key(orgId, type));
      if (set) count += set.size;
    }
    return count;
  }
}

export const sseManager = new SSEManager();
