'use client';

import { useEffect, useState } from 'react';
import { Shield, Zap, Users, Linkedin, Globe } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Theme } from '@/types';
import { apiUrl } from '@/config/api';

export default function AboutPage() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // Only fetch theme on client side (not during build)
    if (typeof window !== 'undefined') {
      fetch(apiUrl('/api/themes/active'))
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setTheme(data);
        })
        .catch(err => {
          // Silently fail - theme is optional
          console.debug('Theme fetch failed:', err);
        });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Header theme={theme} />

      <main className="flex-grow">
        {/* HERO */}
        <section className="relative bg-slate-950 text-white py-20 border-b border-blue-600/30">
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center gap-4 mb-6">
              {/* 3D SPINNING GLOBE */}
              <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center overflow-hidden globe-container">
                <Globe size={24} className="text-white globe-spin-3d" />
                <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.25),transparent)] animate-shimmer pointer-events-none" />
              </div>
              <span className="text-blue-400 font-bold uppercase tracking-widest text-xs">
                About NAPI EU
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
              Hungarian politics.<br />
              EU affairs.<br />
              <span className="text-blue-500">No BS.</span>
            </h1>

            <p className="text-xl text-gray-400">
              Independent journalism covering Central Europe and the European Union.
            </p>
          </div>
        </section>

        {/* STORY */}
        <section className="py-16 border-b border-slate-800">
          <div className="max-w-3xl mx-auto px-4 space-y-6 text-lg text-gray-300 leading-relaxed">
            <h2 className="text-3xl font-bold text-white mb-4">What Is NAPI EU</h2>
            <p>
              NAPI EU is an independent news platform focused on Hungarian politics,
              EU institutions, and Central European power dynamics.
            </p>
            <p>
              Hungary's position inside the European Union is uniquely complex.
              Understanding it requires context, history, and clear-eyed reporting.
            </p>
            <p>
              We serve journalists, analysts, researchers, and readers who want facts,
              not propaganda or vibes.
            </p>
          </div>
        </section>

        {/* COVERAGE */}
        <section className="py-16 bg-slate-800/50 border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center text-white">
              What We Cover
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                ['🇭🇺 Hungarian Politics', 'Government, opposition, power structures'],
                ['🇪🇺 EU Affairs', 'Brussels, policy fights, rule of law'],
                ['🌍 International Relations', 'NATO, security, foreign policy'],
                ['💼 Economy & Business', 'Markets, trade, investment'],
                ['📰 Media & Society', 'Press freedom, culture, education'],
                ['🗺️ Central Europe', 'V4, neighbors, regional politics']
              ].map(([title, desc]) => (
                <div
                  key={title}
                  className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-blue-500/60 transition"
                >
                  <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
                  <p className="text-gray-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW WE WORK */}
        <section className="py-16 border-b border-slate-800">
          <div className="max-w-3xl mx-auto px-4 space-y-8">
            <h2 className="text-3xl font-bold text-white">How We Work</h2>

            <div className="flex gap-4 p-6 bg-slate-800 rounded-xl border border-slate-700">
              <Shield className="text-blue-500" size={32} />
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Independence</h3>
                <p className="text-gray-400">
                  No parties. No governments. No owners telling us what to write.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-slate-800 rounded-xl border border-slate-700">
              <Zap className="text-yellow-500" size={32} />
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Speed & Accuracy</h3>
                <p className="text-gray-400">
                  Fast when needed. Correct always.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-slate-800 rounded-xl border border-slate-700">
              <Users className="text-green-500" size={32} />
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Multiple Views</h3>
                <p className="text-gray-400">
                  Context over spin. Readers decide.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section className="py-16 text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-white mb-6">Connect With Us</h2>
            <p className="text-lg text-gray-400 mb-8">
              Follow our coverage on LinkedIn
            </p>

            <a
              href="https://www.linkedin.com/in/endre-sandor-barcs-92aa54389/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
            >
              <Linkedin size={24} />
              Connect on LinkedIn
            </a>

            <p className="text-sm text-gray-500 mt-8">
              NAPI EU • Independent journalism
            </p>
          </div>
        </section>
      </main>

      <Footer theme={theme} />

      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes globe-spin-3d {
          0% { transform: rotateY(0deg) rotateX(23deg); }
          100% { transform: rotateY(360deg) rotateX(23deg); }
        }
        .animate-shimmer {
          animation: shimmer 2.5s infinite;
        }
        .globe-container {
          perspective: 1000px;
        }
        .globe-spin-3d {
          animation: globe-spin-3d 3s linear infinite;
          transform-style: preserve-3d;
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
        }
      `}</style>
    </div>
  );
}