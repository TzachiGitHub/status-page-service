function wrap(title: string, body: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>body{font-family:sans-serif;color:#333;max-width:600px;margin:0 auto;padding:20px}
.header{background:#1a1a2e;color:#fff;padding:16px 24px;border-radius:8px 8px 0 0}
.content{background:#f8f9fa;padding:24px;border:1px solid #e0e0e0;border-radius:0 0 8px 8px}
.badge{display:inline-block;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;color:#fff}
.badge-red{background:#e74c3c}.badge-green{background:#27ae60}.badge-yellow{background:#f39c12}.badge-blue{background:#3498db}
.footer{margin-top:24px;font-size:12px;color:#999;text-align:center}
</style></head><body>
<div class="header"><h2 style="margin:0">${title}</h2></div>
<div class="content">${body}</div>
<div class="footer">Sent by Status Page Monitor</div>
</body></html>`;
}

export function monitorDownAlert(monitor: { name: string; url?: string }, error: string, timestamp: string): { subject: string; html: string; text: string } {
  const subject = `🔴 Monitor Down: ${monitor.name}`;
  const html = wrap('Monitor Down', `
    <p><span class="badge badge-red">DOWN</span></p>
    <p><strong>${monitor.name}</strong> is not responding.</p>
    ${monitor.url ? `<p>URL: <code>${monitor.url}</code></p>` : ''}
    <p>Error: ${error}</p>
    <p>Time: ${timestamp}</p>
  `);
  const text = `Monitor Down: ${monitor.name}\n${monitor.url || ''}\nError: ${error}\nTime: ${timestamp}`;
  return { subject, html, text };
}

export function monitorRecoveryAlert(monitor: { name: string; url?: string }, downtimeDuration: string): { subject: string; html: string; text: string } {
  const subject = `✅ Monitor Recovered: ${monitor.name}`;
  const html = wrap('Monitor Recovered', `
    <p><span class="badge badge-green">UP</span></p>
    <p><strong>${monitor.name}</strong> is back online.</p>
    ${monitor.url ? `<p>URL: <code>${monitor.url}</code></p>` : ''}
    <p>Downtime: ${downtimeDuration}</p>
  `);
  const text = `Monitor Recovered: ${monitor.name}\n${monitor.url || ''}\nDowntime: ${downtimeDuration}`;
  return { subject, html, text };
}

export function incidentCreated(incident: { title: string; severity: string }, components: string[], initialUpdate: string): { subject: string; html: string; text: string } {
  const subject = `⚠️ Incident: ${incident.title}`;
  const badgeClass = incident.severity === 'CRITICAL' ? 'badge-red' : incident.severity === 'MAJOR' ? 'badge-yellow' : 'badge-blue';
  const html = wrap('New Incident', `
    <p><span class="badge ${badgeClass}">${incident.severity}</span></p>
    <h3>${incident.title}</h3>
    ${components.length ? `<p>Affected: ${components.join(', ')}</p>` : ''}
    <p>${initialUpdate}</p>
  `);
  const text = `Incident: ${incident.title}\nSeverity: ${incident.severity}\nAffected: ${components.join(', ')}\n${initialUpdate}`;
  return { subject, html, text };
}

export function incidentUpdated(incident: { title: string; status: string }, updateText: string): { subject: string; html: string; text: string } {
  const subject = `📋 Incident Update: ${incident.title}`;
  const html = wrap('Incident Update', `
    <p><strong>Status:</strong> ${incident.status}</p>
    <h3>${incident.title}</h3>
    <p>${updateText}</p>
  `);
  const text = `Incident Update: ${incident.title}\nStatus: ${incident.status}\n${updateText}`;
  return { subject, html, text };
}

export function subscriptionConfirmation(confirmUrl: string): { subject: string; html: string; text: string } {
  const subject = 'Confirm your status page subscription';
  const html = wrap('Confirm Subscription', `
    <p>Please confirm your subscription by clicking the link below:</p>
    <p><a href="${confirmUrl}" style="background:#3498db;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;display:inline-block">Confirm Subscription</a></p>
    <p style="font-size:12px;color:#999">If you didn't request this, ignore this email.</p>
  `);
  const text = `Confirm your subscription: ${confirmUrl}`;
  return { subject, html, text };
}

export function unsubscribeConfirmation(): { subject: string; html: string; text: string } {
  const subject = 'You have been unsubscribed';
  const html = wrap('Unsubscribed', `
    <p>You have been successfully unsubscribed from status page notifications.</p>
  `);
  const text = 'You have been successfully unsubscribed from status page notifications.';
  return { subject, html, text };
}
