'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Eye } from 'lucide-react';
import type { Article } from '@/types';
import { apiUrl } from '@/config/api';
export default function MostPopular() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopular();
  }, []);

  const fetchPopular = async () => {
    try {
      const res = await fetch(apiUrl('/api/articles/popular?limit=10'));
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (error) {
      console.error('Failed to fetch popular articles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4">
        <div className="flex items-center gap-2 text-white">
          <TrendingUp size={24} />
          <h2 className="text-xl font-black uppercase">Most Popular</h2>
        </div>
      </div>

      {/* Articles List */}
      <div className="p-5 space-y-4">
        {articles.map((article, idx) => (
          <div
            key={article.id}
            onClick={() => router.push(`/articles/${article.slug}`)}
            className="flex gap-3 cursor-pointer group pb-4 border-b border-gray-200 last:border-0 last:pb-0 transition hover:bg-gray-50 -mx-2 px-2 py-2 rounded"
          >
            {/* Ranking Number */}
            <div className="flex-shrink-0">
              <div
                className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm ${
                  idx === 0
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                    : idx === 1
                    ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white'
                    : idx === 2
                    ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {idx + 1}
              </div>
            </div>

            {/* Article Info */}
            <div className="flex-grow min-w-0">
              <h4 className="font-bold text-sm line-clamp-2 group-hover:text-blue-600 transition mb-1">
                {article.title}
              </h4>
              
              {/* Stats */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Eye size={12} />
                  <span>{(article.views || 0).toLocaleString()}</span>
                </div>
                {article.readTime && (
                  <span>⏱️ {article.readTime} min</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="px-5 pb-5">
        <button
          onClick={() => router.push('/articles')}
          className="w-full py-2 bg-gray-100 hover:bg-gray-200 font-semibold text-sm rounded transition"
        >
          View All Articles →
        </button>
      </div>
    </div>
  );
}