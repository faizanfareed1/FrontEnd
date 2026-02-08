'use client';

import type { Theme } from '@/types';

interface FooterProps {
  theme?: Theme | null;
}

export default function Footer({ theme }: FooterProps) {
  return (
    <footer className="bg-gray-900 dark:bg-black text-white py-8 mt-12 border-t border-gray-800 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">
              {theme?.siteTitle || 'NapiEU'}
            </h3>
            <p className="text-gray-300 dark:text-gray-400">
              {theme?.siteTagline || 'Your source for Hungarian politics and EU news'}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/articles" className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors">
                  All Articles
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors">
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Copyright */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect</h4>
            <p className="text-gray-300 dark:text-gray-400">
              © {new Date().getFullYear()} {theme?.siteTitle || 'NapiEU'}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}