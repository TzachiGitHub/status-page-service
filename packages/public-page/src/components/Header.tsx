import { Sun, Moon } from 'lucide-react';

export function Header({
  name,
  logo,
  theme,
  onToggleTheme,
}: {
  name: string;
  logo?: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}) {
  return (
    <header className="flex items-center justify-between py-6">
      <div className="flex items-center gap-3">
        {logo && <img src={logo} alt="" className="w-8 h-8 rounded" />}
        <h1 className="text-xl sm:text-2xl font-bold">{name}</h1>
      </div>
      <button
        onClick={onToggleTheme}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    </header>
  );
}
