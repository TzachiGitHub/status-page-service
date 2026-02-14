/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        status: {
          operational: '#10b981',
          degraded: '#f59e0b',
          partial: '#f97316',
          major: '#ef4444',
          maintenance: '#3b82f6',
          none: '#6b7280',
        },
      },
    },
  },
  plugins: [],
};
