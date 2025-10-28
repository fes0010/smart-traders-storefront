'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun, Palette } from 'lucide-react';

const themes = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'emerald', label: 'Emerald' },
  { id: 'amber', label: 'Amber' },
  { id: 'rose', label: 'Rose' },
];

export default function ThemeToggle() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<string>('light');

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('store-theme') : null;
    const preferred = saved || 'light';
    setTheme(preferred);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', preferred);
    }
  }, []);

  function applyTheme(next: string) {
    setTheme(next);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', next);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('store-theme', next);
    }
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Change theme"
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[color:var(--border)] bg-[var(--card-bg)] text-[color:var(--foreground)] hover:opacity-90"
      >
        {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        <span className="hidden sm:inline text-sm">Theme</span>
        <Palette className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-lg border border-[color:var(--border)] bg-[var(--card-bg)] shadow-lg z-50">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => applyTheme(t.id)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-[color:var(--background)] ${
                theme === t.id ? 'font-semibold' : ''
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


