import { create } from 'zustand';

interface DarkModeState {
  dark: boolean;
  toggle: () => void;
}

const stored = localStorage.getItem('darkMode');
const initial = stored !== null ? stored === 'true' : true;

if (initial) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

export const useDarkModeStore = create<DarkModeState>((set) => ({
  dark: initial,
  toggle: () =>
    set((s) => {
      const next = !s.dark;
      localStorage.setItem('darkMode', String(next));
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { dark: next };
    }),
}));
