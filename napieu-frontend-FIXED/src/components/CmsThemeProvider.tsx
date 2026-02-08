'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { themesApi } from '@/lib/api';

export function CmsThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: theme } = useQuery({
    queryKey: ['activeTheme'],
    queryFn: themesApi.getActive,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!theme) return;

    const root = document.documentElement;

    root.style.setProperty('--color-primary', theme.primaryColor);
    root.style.setProperty('--color-secondary', theme.secondaryColor);
    root.style.setProperty('--color-accent', theme.accentColor);
    root.style.setProperty('--color-background', theme.backgroundColor);
    root.style.setProperty('--color-text', theme.textColor);

    root.style.setProperty('--font-heading', theme.headingFont);
    root.style.setProperty('--font-body', theme.bodyFont);
    root.style.setProperty('--max-width', `${theme.maxWidth}px`);

    if (theme.customCss) {
      const styleId = 'custom-theme-css';
      let style = document.getElementById(styleId) as HTMLStyleElement | null;

      if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        document.head.appendChild(style);
      }

      style.textContent = theme.customCss;
    }

    if (theme.siteTitle) {
      document.title = `${theme.siteTitle} - ${theme.siteTagline}`;
    }
  }, [theme]);

  return <>{children}</>;
}
