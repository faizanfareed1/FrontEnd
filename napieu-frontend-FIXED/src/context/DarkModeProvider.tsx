'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const saved = localStorage.getItem('theme') as ThemeMode | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const initial = saved ?? (prefersDark ? 'dark' : 'light');
    setMode(initial);
    applyTheme(initial);
  }, []);

  const applyTheme = (theme: ThemeMode) => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  };

  const toggleTheme = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  const setTheme = (theme: ThemeMode) => {
    setMode(theme);
    localStorage.setItem('theme', theme);
    applyTheme(theme);
  };

  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within DarkModeProvider');
  }
  return ctx;
}
