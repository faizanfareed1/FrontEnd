import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import {CmsThemeProvider as ThemeProvider } from '@/components/CmsThemeProvider';

export const metadata: Metadata = {
  title: 'NapiEU - Hungarian Politics & EU Affairs',
  description: 'Your source for Hungarian politics and European Union news and analysis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}