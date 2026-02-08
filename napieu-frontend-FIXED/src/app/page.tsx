'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, Clock, Flame, Zap, ArrowRight, X, 
  Star, Eye, Mail, TrendingUp, Award, CheckCircle
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LiveNewsTicker from '@/components/LiveNewsTicker';
import type { Theme, Article, Category } from '@/types';
import { apiUrl } from '@/config/api';

export default function HomePage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBreakingBanner, setShowBreakingBanner] = useState(true);
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [breakingArticle, setBreakingArticle] = useState<Article | null>(null);
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [editorsPickArticles, setEditorsPickArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetchAll();
  }, []);
  const fetchAll = async () => {
  try {
    const [articlesRes, settingsRes] = await Promise.all([
      fetch(apiUrl('/api/articles')),
      fetch(apiUrl('/api/homepage-settings')),
    ]);

    // THEME (handled separately so it can fail safely)
    try {
      const themeRes = await fetch(apiUrl('/api/themes/active'));
      if (themeRes.ok) {
        const themeData = await themeRes.json();
        setTheme(themeData);
      }
    } catch {
      console.warn('⚠️ Theme endpoint failed, using default styling');
    }

    let allArticles: Article[] = [];

    if (articlesRes.ok) {
      const data = await articlesRes.json();
      allArticles = data.content || data;
      setArticles(allArticles);
    }

    if (settingsRes.ok) {
      const data = await settingsRes.json();
      setSettings(data);

      // Breaking News
      if (data.showBreakingNews && data.breakingNewsArticleId) {
        const article = allArticles.find(a => a.id === data.breakingNewsArticleId);
        if (article) setBreakingArticle(article);
      }

      // Featured Article
      if (data.featuredArticleId) {
        const article = allArticles.find(a => a.id === data.featuredArticleId);
        if (article) setFeaturedArticle(article);
      }

      // Editor's Picks (string, ids array, or full articles)
      let picks: Article[] = [];

      if (typeof data.editorsPicks === 'string' && data.editorsPicks.trim()) {
        const ids = data.editorsPicks
        .split(',')
        .map((s: string) => parseInt(s.trim(), 10))
        .filter((n: number) => !isNaN(n));

        picks = ids 
        .map((id: number) => allArticles.find(a => a.id === id))
        .filter(Boolean) as Article[];

      } else if (Array.isArray(data.editorsPicksIds)) {
        picks = data.editorsPicksIds
          .map((id: number) => allArticles.find(a => a.id === id))
          .filter(Boolean) as Article[];
      } else if (Array.isArray(data.editorsPicksArticles)) {
        picks = data.editorsPicksArticles;
      }

      if (picks.length) {
        setEditorsPickArticles(
          picks.filter(
            (a, i, self) => i === self.findIndex(x => x.id === a.id)
          )
        );
      }
    }
  } catch (error) {
    console.error('❌ Failed to fetch data:', error);
  } finally {
    setLoading(false);
  }
};
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterStatus('loading');

    try {
      const response = await fetch(apiUrl('/api/newsletter/subscribe'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setNewsletterStatus('success');
        setNewsletterMessage('Thanks for subscribing!');
        setEmail('');
        setTimeout(() => { setNewsletterStatus('idle'); setNewsletterMessage(''); }, 3000);
      } else {
        setNewsletterStatus('error');
        setNewsletterMessage('Failed to subscribe');
        setTimeout(() => { setNewsletterStatus('idle'); setNewsletterMessage(''); }, 3000);
      }
    } catch (error) {
      setNewsletterStatus('error');
      setNewsletterMessage('Network error');
      setTimeout(() => { setNewsletterStatus('idle'); setNewsletterMessage(''); }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-white font-bold text-xl">NAPI EU</h2>
          <p className="text-gray-400 text-sm mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  const displayFeaturedArticle = featuredArticle || articles[0];
  const trendingArticles = articles.slice(1, 5);
  const latestArticles = articles.slice(5, 11);
  const mostPopular = [...articles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Recent';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Header theme={theme} />
      <LiveNewsTicker />

      {settings?.showBreakingNews && showBreakingBanner && breakingArticle && (
        <div className="bg-red-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Zap size={16} fill="white" />
                <span className="font-bold text-xs uppercase">Breaking</span>
              </div>
              <button onClick={() => router.push(`/articles/${breakingArticle.slug}`)} className="flex-grow text-left hover:underline text-sm font-medium line-clamp-1">
                {settings.breakingNewsCustomText || breakingArticle.title}
              </button>
              <button onClick={() => setShowBreakingBanner(false)} className="flex-shrink-0 hover:bg-white/20 p-1 rounded transition"><X size={16} /></button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow">
        {displayFeaturedArticle && (
          <section className="bg-slate-950 text-white border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4 py-16">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div onClick={() => router.push(`/articles/${displayFeaturedArticle.slug}`)} className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group">
                  {displayFeaturedArticle.featuredImage ? (
                    <img src={displayFeaturedArticle.featuredImage} alt={displayFeaturedArticle.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center"><Flame size={80} className="text-slate-700" /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-4 left-4"><span className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold uppercase">Featured</span></div>
                </div>
                <div className="space-y-6">
                  <h1 onClick={() => router.push(`/articles/${displayFeaturedArticle.slug}`)} className="text-4xl lg:text-5xl font-black leading-tight cursor-pointer hover:text-gray-300 transition">{displayFeaturedArticle.title}</h1>
                  {displayFeaturedArticle.excerpt && <p className="text-lg text-gray-300">{displayFeaturedArticle.excerpt}</p>}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2"><Calendar size={16} /><span>{formatDate(displayFeaturedArticle.publishedAt)}</span></div>
                    <div className="flex items-center gap-2"><Clock size={16} /><span>{displayFeaturedArticle.readTime} min</span></div>
                  </div>
                  <button onClick={() => router.push(`/articles/${displayFeaturedArticle.slug}`)} className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-bold hover:bg-gray-200 transition">
                    Read Article <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="py-16 bg-slate-900 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-8"><Flame size={24} className="text-orange-500" /><h2 className="text-3xl font-black text-white">Trending</h2></div>
                <div className="grid md:grid-cols-2 gap-6">
                  {trendingArticles.map((article, idx) => (
                    <article key={article.id} onClick={() => router.push(`/articles/${article.slug}`)} className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer group">
                      <div className="relative aspect-video">
                        {article.featuredImage ? (
                          <img src={article.featuredImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                        ) : (
                          <div className="w-full h-full bg-slate-700"></div>
                        )}
                        <div className="absolute top-3 left-3"><span className="w-8 h-8 bg-slate-900 text-white font-bold rounded flex items-center justify-center text-sm">{idx + 1}</span></div>
                      </div>
                      <div className="p-5">
                        {article.categories?.[0] && <span className="inline-block px-2.5 py-1 text-xs font-bold text-white mb-2" style={{ backgroundColor: article.categories[0].color }}>{article.categories[0].name}</span>}
                        <h3 className="font-bold text-lg line-clamp-2 text-white group-hover:text-blue-400 transition">{article.title}</h3>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-8"><TrendingUp size={24} className="text-white" /><h2 className="text-2xl font-black text-white">Most Popular</h2></div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 space-y-5">
                  {mostPopular.slice(0, 5).map((article, idx) => (
                    <div key={article.id} onClick={() => router.push(`/articles/${article.slug}`)} className="flex gap-3 cursor-pointer group pb-5 border-b border-slate-700 last:border-0 last:pb-0">
                      <span className="flex-shrink-0 w-8 h-8 bg-slate-700 text-white rounded flex items-center justify-center font-bold text-sm">{idx + 1}</span>
                      <div>
                        <h4 className="font-bold text-sm line-clamp-2 text-white group-hover:text-blue-400 transition">{article.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1"><Eye size={12} /><span>{(article.views || 0).toLocaleString()}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {editorsPickArticles.length > 0 && (
          <section className="py-16 bg-slate-800 border-b border-slate-700">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center gap-3 mb-8"><Award size={24} className="text-yellow-500" /><h2 className="text-3xl font-black text-white">Editor's Picks</h2></div>
              <div className="grid md:grid-cols-3 gap-6">
                {editorsPickArticles.map((article) => (
                  <article key={article.id} onClick={() => router.push(`/articles/${article.slug}`)} className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer group">
                    <div className="relative aspect-video">
                      {article.featuredImage ? (
                        <img src={article.featuredImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      ) : (
                        <div className="w-full h-full bg-slate-700"></div>
                      )}
                      <div className="absolute top-3 right-3"><Star size={20} className="text-yellow-500" fill="currentColor" /></div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg line-clamp-2 text-white group-hover:text-blue-400 transition">{article.title}</h3>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {latestArticles.length > 0 && (
          <section className="py-16 bg-slate-900 border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-black mb-8 text-white">Latest News</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {latestArticles.map((article) => (
                  <article key={article.id} onClick={() => router.push(`/articles/${article.slug}`)} className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer group">
                    <div className="relative aspect-video">
                      {article.featuredImage ? (
                        <img src={article.featuredImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      ) : (
                        <div className="w-full h-full bg-slate-700"></div>
                      )}
                    </div>
                    <div className="p-5">
                      {article.categories?.[0] && <span className="inline-block px-2.5 py-1 text-xs font-bold text-white mb-2" style={{ backgroundColor: article.categories[0].color }}>{article.categories[0].name}</span>}
                      <h3 className="font-bold text-lg line-clamp-2 mb-3 text-white group-hover:text-blue-400 transition">{article.title}</h3>
                      {article.excerpt && <p className="text-sm text-gray-400 line-clamp-2">{article.excerpt}</p>}
                    </div>
                  </article>
                ))}
              </div>
              <div className="text-center mt-12">
                <button onClick={() => router.push('/articles')} className="inline-flex items-center gap-2 bg-slate-950 text-white px-8 py-4 font-bold hover:bg-slate-800 transition">
                  View All Articles <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </section>
        )}

        {settings?.showQuote && settings.quoteText && (
          <section className="py-16 bg-slate-950 text-white border-b border-slate-800">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <blockquote className="text-2xl md:text-3xl font-bold italic mb-6">"{settings.quoteText}"</blockquote>
              <p className="text-lg text-gray-400">— {settings.quoteAuthor}</p>
            </div>
          </section>
        )}

        {settings?.showNewsletter && (
          <section className="py-12 bg-slate-950 text-white border-b border-slate-800">
            <div className="max-w-3xl mx-auto px-4">
              <div className="flex items-center gap-6">
                <Mail size={40} className="text-white flex-shrink-0" />
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold mb-2">{settings.newsletterTitle}</h3>
                  <p className="text-gray-400 text-sm mb-4">{settings.newsletterDescription}</p>
                  <form onSubmit={handleNewsletterSubmit} className="flex gap-3">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className="flex-grow px-4 py-2.5 text-white bg-slate-800 border border-slate-700 focus:border-blue-500 focus:outline-none transition" required disabled={newsletterStatus === 'loading'} />
                    <button type="submit" disabled={newsletterStatus === 'loading'} className="px-6 py-2.5 bg-white text-black font-bold hover:bg-gray-200 transition disabled:opacity-50">
                      {newsletterStatus === 'loading' ? '...' : 'Subscribe'}
                    </button>
                  </form>
                  {newsletterMessage && (
                    <div className={`mt-3 text-sm flex items-center gap-2 ${newsletterStatus === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                      {newsletterStatus === 'success' && <CheckCircle size={16} />}
                      <span>{newsletterMessage}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer theme={theme} />
    </div>
  );
}