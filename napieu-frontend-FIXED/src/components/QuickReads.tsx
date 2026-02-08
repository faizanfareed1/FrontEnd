'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Clock } from 'lucide-react';
import type { Article } from '@/types';
import { apiUrl } from '@/config/api';

export default function QuickReads() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuickReads();
  }, []);

  const fetchQuickReads = async () => {
    try {
      const res = await fetch(apiUrl('/api/articles/quick-reads?maxMinutes=3&limit=6'));
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (error) {
      console.error('Failed to fetch quick reads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || articles.length === 0) return null;

  return (
    <section className="py-12 bg-gradient-to-r from-amber-50 to-orange-50 border-y border-amber-200">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
              <Zap size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900">Quick Reads</h2>
              <p className="text-gray-600">Perfect for busy readers • Under 3 minutes</p>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article
              key={article.id}
              onClick={() => router.push(`/articles/${article.slug}`)}
              className="bg-white border-2 border-amber-200 rounded-lg overflow-hidden hover:border-amber-400 hover:shadow-lg transition cursor-pointer group"
            >
              {/* Image */}
              {article.featuredImage && (
                <div className="relative aspect-video overflow-hidden bg-gray-100">
                  <img
                    src={article.featuredImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {/* Quick Read Badge */}
                  <div className="absolute top-3 left-3">
                    <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      <Zap size={12} fill="white" />
                      <span>QUICK READ</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-5">
                {/* Category */}
                {article.categories?.[0] && (
                  <span
                    className="inline-block px-2.5 py-1 text-xs font-bold text-white mb-2 rounded"
                    style={{ backgroundColor: article.categories[0].color }}
                  >
                    {article.categories[0].name}
                  </span>
                )}

                {/* Title */}
                <h3 className="font-bold text-lg line-clamp-2 mb-2 group-hover:text-orange-600 transition">
                  {article.title}
                </h3>

                {/* Excerpt */}
                {article.excerpt && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {article.excerpt}
                  </p>
                )}

                {/* Read Time */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={14} />
                  <span className="font-semibold">{article.readTime} min read</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}