'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { Theme } from '@/types';

interface HeaderProps {
  theme?: Theme | null;
}

export default function Header({ theme }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-slate-900 shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <Link href="/" className="flex items-center space-x-3">
            {theme?.logoUrl && (
              <img
                src={theme.logoUrl}
                alt={theme.siteTitle}
                style={{
                  width: `${theme.logoWidth || 40}px`,
                  height: `${theme.logoHeight || 40}px`,
                  objectFit: 'contain'
                }}
                className="rounded"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">
                {theme?.siteTitle || 'NapiEU'}
              </h1>
              <p className="text-sm text-slate-300">
                {theme?.siteTagline || 'Hungarian Politics & EU Affairs'}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-slate-200 hover:text-white font-semibold transition"
            >
              Home
            </Link>
            <Link 
              href="/articles" 
              className="text-slate-200 hover:text-white font-semibold transition"
            >
              Articles
            </Link>
            <Link 
              href="/about" 
              className="text-slate-200 hover:text-white font-semibold transition"
            >
              About
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-slate-800"
            >
              {mobileMenuOpen ? (
                <X size={24} className="text-white" />
              ) : (
                <Menu size={24} className="text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-slate-800 mt-4">
            <Link
              href="/"
              className="block py-2 text-slate-200 hover:text-white font-semibold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/articles"
              className="block py-2 text-slate-200 hover:text-white font-semibold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Articles
            </Link>
            <Link
              href="/about"
              className="block py-2 text-slate-200 hover:text-white font-semibold"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}