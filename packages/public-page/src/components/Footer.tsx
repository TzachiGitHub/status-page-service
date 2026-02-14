export function Footer({ lastUpdated }: { lastUpdated: Date }) {
  return (
    <footer className="py-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
      <div>
        Last updated: {lastUpdated.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })}
      </div>
      <div>
        Powered by{' '}
        <a href="#" className="text-blue-500 hover:underline">
          StatusPage
        </a>
      </div>
    </footer>
  );
}
