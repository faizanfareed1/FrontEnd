'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Radio } from 'lucide-react';
import { apiUrl } from '@/config/api';

interface Ticker {
  id: number;
  text: string;
  linkUrl?: string;
  icon: string;
  priority: number;
  isActive: boolean;
}

export default function LiveNewsTicker() {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [tickerSpeed, setTickerSpeed] = useState(50);
  const tickerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [singleSetWidth, setSingleSetWidth] = useState(0);
  const [repeatCount, setRepeatCount] = useState(4);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const tickersRes = await fetch(apiUrl('/api/live-ticker'));
      if (tickersRes.ok) {
        const data = await tickersRes.json();
        setTickers(
          data
            .filter((t: Ticker) => t.isActive)
            .sort((a: Ticker, b: Ticker) => b.priority - a.priority)
        );
      }

      const settingsRes = await fetch(apiUrl('/api/homepage-settings'));
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        if (typeof settings.tickerSpeed === 'number') {
          setTickerSpeed(settings.tickerSpeed);
        }
      }
    } catch (error) {
      console.error('Failed to fetch ticker data:', error);
    }
  };

  // Measure one set's pixel width and calculate repeats
  const measure = useCallback(() => {
    if (!measureRef.current || !tickerRef.current || tickers.length === 0) return;

    const setWidth = measureRef.current.scrollWidth;
    const containerWidth = tickerRef.current.offsetWidth;

    if (setWidth > 0) {
      const needed = Math.ceil(containerWidth / setWidth) + 2;
      const final = Math.max(needed, 2);
      setSingleSetWidth(setWidth);
      setRepeatCount(final);
    }
  }, [tickers]);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  // Set animation speed
  useEffect(() => {
    if (!contentRef.current || tickers.length === 0 || singleSetWidth === 0) return;

    const MIN_DURATION = 4;
    const MAX_DURATION = 120;
    const normalized = (tickerSpeed - 10) / 90;
    const duration =
      MAX_DURATION - Math.pow(normalized, 2) * (MAX_DURATION - MIN_DURATION);

    contentRef.current.style.animationDuration = `${duration}s`;
  }, [tickers, tickerSpeed, singleSetWidth]);

  const repeatedTickers = useMemo(() => {
    const result = [];
    for (let i = 0; i < repeatCount; i++) {
      for (let j = 0; j < tickers.length; j++) {
        result.push({ ...tickers[j], _key: `${i}-${j}` });
      }
    }
    return result;
  }, [tickers, repeatCount]);

  if (tickers.length === 0) return null;

  const GAP = 32; // gap-8 = 32px

  const tickerItem = (ticker: Ticker & { _key: string }) => (
    <span
      key={ticker._key}
      className="whitespace-nowrap font-medium text-sm flex-shrink-0 flex items-center gap-2"
    >
      <span>{ticker.icon}</span>
      {ticker.linkUrl ? (
        <a href={ticker.linkUrl} className="hover:underline">
          {ticker.text}
        </a>
      ) : (
        <span>{ticker.text}</span>
      )}
    </span>
  );

  return (
    <div className="bg-red-600 text-white py-2 overflow-hidden border-b border-red-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Radio size={16} className="animate-pulse" />
            <span className="font-bold text-xs uppercase tracking-wider">
              Live
            </span>
          </div>

          <div ref={tickerRef} className="flex-grow overflow-hidden relative">
            {/* Hidden measure element — renders one set to get exact pixel width */}
            <div
              ref={measureRef}
              className="flex gap-8 absolute invisible"
              style={{ width: 'max-content' }}
              aria-hidden="true"
            >
              {tickers.map((ticker, i) => (
                <span
                  key={`measure-${i}`}
                  className="whitespace-nowrap font-medium text-sm flex-shrink-0 flex items-center gap-2"
                >
                  <span>{ticker.icon}</span>
                  <span>{ticker.text}</span>
                </span>
              ))}
            </div>

            {/* Actual scrolling ticker */}
            {singleSetWidth > 0 && (
              <div
                ref={contentRef}
                className="flex gap-8"
                style={{
                  width: 'max-content',
                  animation: `ticker-scroll linear infinite`,
                  willChange: 'transform',
                }}
              >
                {repeatedTickers.map((ticker) => tickerItem(ticker))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes ticker-scroll {
          from {
            transform: translateX(0px);
          }
          to {
            transform: translateX(-${singleSetWidth + GAP}px);
          }
        }
      `}</style>
    </div>
  );
}