'use client';

import { useEffect, useState, useRef } from 'react';
import { Moon, Sun, Palette, Check } from 'lucide-react';

const themes = [
  { id: 'light', label: 'Light', icon: '☀️', description: 'Clean & bright' },
  { id: 'dark', label: 'Dark', icon: '🌙', description: 'Easy on the eyes' },
  { id: 'midnight', label: 'Midnight', icon: '🌌', description: 'Deep & rich' },
  { id: 'emerald', label: 'Emerald', icon: '🌿', description: 'Fresh & natural' },
  { id: 'sunset', label: 'Sunset', icon: '🌅', description: 'Warm & cozy' },
  { id: 'rose', label: 'Rose', icon: '🌸', description: 'Soft & elegant' },
  { id: 'ocean', label: 'Ocean', icon: '🌊', description: 'Cool & calm' },
];

export default function ThemeToggle() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<string>('light');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('store-theme') : null;
    const preferred = saved || 'light';
    setTheme(preferred);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', preferred);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const isDark = theme === 'dark' || theme === 'midnight';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Change theme"
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[color:var(--border)] bg-[var(--card-bg)] text-[color:var(--foreground)] hover:border-[color:var(--primary)] transition-all"
      >
        {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        <span className="hidden sm:inline text-sm font-medium">Theme</span>
        <Palette className="w-4 h-4 text-[color:var(--muted)]" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[color:var(--border)] bg-[var(--card-bg)] shadow-xl z-50 overflow-hidden">
          <div className="p-2">
            <p className="text-xs font-medium text-[color:var(--muted)] px-2 py-1 uppercase tracking-wider">
              Choose Theme
            </p>
          </div>
          <div className="p-1">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => applyTheme(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                  theme === t.id 
                    ? 'bg-[color:var(--primary)] text-[color:var(--on-primary)]' 
                    : 'hover:bg-[color:var(--accent)]'
                }`}
              >
                <span className="text-lg">{t.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium">{t.label}</div>
                  <div className={`text-xs ${theme === t.id ? 'opacity-80' : 'text-[color:var(--muted)]'}`}>
                    {t.description}
                  </div>
                </div>
                {theme === t.id && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
