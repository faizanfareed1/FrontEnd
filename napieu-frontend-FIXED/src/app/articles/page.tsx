'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Eye, Search, Filter, Newspaper } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Theme, Article, Category } from '@/types';
import { apiUrl } from '@/config/api';

export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [themeRes, articlesRes, categoriesRes] = await Promise.all([
        fetch(apiUrl('/api/themes/active')),
        fetch(apiUrl('/api/articles')),
        fetch(apiUrl('/api/categories'))
      ]);

      if (themeRes.ok) setTheme(await themeRes.json());

      if (articlesRes.ok) {
        const data = await articlesRes.json();
        setArticles(data.content || data);
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.content || data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      article.categories?.some(cat => cat.id.toString() === selectedCategory);

    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Recent';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-white font-black text-xl tracking-wide">NAPI_EU</h2>
          <p className="text-gray-400 text-sm mt-2">Loading coverage…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Header theme={theme} />

      <main className="flex-grow">
        {/* HERO */}
        <section className="relative bg-slate-950 text-white py-20 border-b border-blue-600/30">
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-4 mb-6">
              {/* 3D ROTATING NEWSPAPER */}
              <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center overflow-hidden newspaper-container">
                <Newspaper size={24} className="text-white newspaper-flip-3d" />
                <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.25),transparent)] animate-shimmer pointer-events-none" />
              </div>
              <span className="text-blue-400 font-bold uppercase tracking-widest text-xs">
                Coverage
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black mb-4">
              News & Analysis
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl">
              Independent reporting on Hungarian politics, EU affairs,
              and Central European power dynamics.
            </p>
          </div>
        </section>

        {/* FILTERS */}
        <section className="bg-slate-800/80 backdrop-blur border-b border-slate-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search coverage…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500/40 focus:outline-none transition"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-slate-900/80 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500/40 appearance-none cursor-pointer min-w-[200px]"
                >
                  <option value="all">All Topics</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id.toString()}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(searchQuery || selectedCategory !== 'all') && (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-gray-400">
                  Showing {filteredArticles.length} items
                </span>
                {searchQuery && (
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-full">
                    "{searchQuery}"
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-full">
                    {categories.find(c => c.id.toString() === selectedCategory)?.name}
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="ml-2 text-blue-400 hover:text-blue-300 underline"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ARTICLES */}
        <section className="py-14">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map(article => (
                <article
                  key={article.id}
                  onClick={() => router.push(`/articles/${article.slug}`)}
                  className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:border-blue-500/40 transition-all duration-300 group"
                >
                  <div className="relative aspect-video bg-slate-700 overflow-hidden">
                    {article.featuredImage ? (
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800" />
                    )}
                  </div>

                  <div className="p-6">
                    {article.categories?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {article.categories.slice(0, 2).map(category => (
                          <span
                            key={category.id}
                            className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white rounded-full shadow-sm"
                            style={{ backgroundColor: category.color || '#3b82f6' }}
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <h2 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-blue-400 transition">
                      {article.title}
                    </h2>

                    {article.excerpt && (
                      <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                        {article.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(article.publishedAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {article.readTime} min
                      </div>
                      {article.views > 0 && (
                        <div className="flex items-center gap-1">
                          <Eye size={14} />
                          {article.views.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer theme={theme} />

      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes newspaper-flip-3d {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        .animate-shimmer {
          animation: shimmer 2.5s infinite;
        }
        .newspaper-container {
          perspective: 1000px;
        }
        .newspaper-flip-3d {
          animation: newspaper-flip-3d 3s linear infinite;
          transform-style: preserve-3d;
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
        }
      `}</style>
    </div>
  );
}