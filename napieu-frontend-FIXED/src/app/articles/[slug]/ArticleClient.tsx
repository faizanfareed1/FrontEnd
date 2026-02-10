'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, ArrowLeft, Tag, Eye, Share2, ExternalLink, Twitter, Facebook, Link as LinkIcon, Check } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Theme } from '@/types';
import { apiUrl } from '@/config/api';

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  readTime: number;
  views: number;
  featuredImage: string;
  source: string;
  categories: Array<{ id: number; name: string; slug: string; color: string }>;
}

interface ArticleClientProps {
  article: Article | null;
  error: string;
  slug: string;
}

export default function ArticleClient({ article: initialArticle, error: initialError, slug }: ArticleClientProps) {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(initialArticle);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [error, setError] = useState(initialError);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTheme();
    
    // Record view count (client-side only, won't affect static generation)
    if (article) {
      fetch(apiUrl(`/api/articles/${article.id}/view`), {
        method: 'POST',
      }).catch(err => console.error('Failed to record view:', err));
    }

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article]);

  const fetchTheme = async () => {
    try {
      const response = await fetch(apiUrl('/api/themes/active'));
      if (response.ok) {
        const data = await response.json();
        setTheme(data);
      }
    } catch (err) {
      console.error('Failed to fetch theme:', err);
    }
  };

  const shareOnTwitter = () => {
    if (!article) return;
    const url = window.location.href;
    const text = `${article.title}\n\nRead more on NAPI EU:`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, 
      '_blank',
      'width=550,height=420'
    );
  };

  const shareOnFacebook = () => {
    const url = window.location.href;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, 
      '_blank',
      'width=550,height=420'
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-900">
        <Header theme={theme} />
        <div className="flex-grow flex items-center justify-center px-4">
          <div className="text-center max-w-md bg-slate-800 p-12 rounded-2xl shadow-2xl border border-slate-700">
            <div className="text-6xl mb-6">😕</div>
            <h1 className="text-3xl font-bold text-white mb-4">
              {error || 'Article not found'}
            </h1>
            <p className="text-gray-400 mb-8">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              <ArrowLeft size={20} />
              Back to Home
            </button>
          </div>
        </div>
        <Footer theme={theme} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 relative">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-800 z-50">
        <div
          className="h-full bg-blue-600 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Subtle Pattern Background */}
      <div className="fixed inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, #475569 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}></div>

      <Header theme={theme} />

      <main className="flex-grow relative">
        {/* SEAMLESS - No card wrapper, content flows naturally */}
        <article className="max-w-5xl mx-auto px-6 py-12">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition font-medium mb-8"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          {/* Categories */}
          {article.categories && article.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {article.categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() =>
                    router.push(`/articles?category=${category.slug}`)
                  }
                  className="px-4 py-2 rounded-lg text-sm font-bold text-white hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: category.color || '#3b82f6',
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed">
              {article.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 pb-8 mb-8 border-b-2 border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {article.author.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-white">{article.author}</p>
                <p className="text-sm text-gray-400">
                  {new Date(article.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-gray-400">
              <div className="flex items-center gap-2">
                <Clock size={18} />
                <span className="font-medium">{article.readTime} min read</span>
              </div>

              {article.views > 0 && (
                <div className="flex items-center gap-2">
                  <Eye size={18} />
                  <span className="font-medium">{article.views.toLocaleString()} views</span>
                </div>
              )}
            </div>
          </div>

          {/* Featured Image */}
          {article.featuredImage && (
            <div className="mb-12">
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="article-content-dark prose prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Source */}
          {article.source && (
            <div className="mb-12 p-6 bg-slate-800/60 border-l-4 border-blue-600 rounded-xl backdrop-blur-sm">
              <p className="text-sm text-gray-300 font-semibold mb-2">📰 Original Source</p>
              <a
                href={article.source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-2 break-all"
              >
                {article.source}
                <ExternalLink size={16} />
              </a>
            </div>
          )}

          {/* Share Section */}
          <div className="mb-12 pt-12 border-t-2 border-slate-800">
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-blue-600/50"
              >
                <Share2 size={20} />
                Share Article
              </button>

              {showShareMenu && (
                <div className="flex flex-wrap items-center gap-3 animate-fadeIn">
                  <button
                    onClick={shareOnTwitter}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition border border-slate-700"
                  >
                    <Twitter size={18} />
                    Twitter
                  </button>
                  <button
                    onClick={shareOnFacebook}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition"
                  >
                    <Facebook size={18} />
                    Facebook
                  </button>
                  <button
                    onClick={copyLink}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition"
                  >
                    {copied ? <Check size={18} /> : <LinkIcon size={18} />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Topics */}
          {article.categories && article.categories.length > 0 && (
            <div className="pt-12 border-t-2 border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <Tag size={24} className="text-blue-400" />
                <h3 className="text-2xl font-bold text-white">Related Topics</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {article.categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() =>
                      router.push(`/articles?category=${category.slug}`)
                    }
                    className="px-5 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold text-white transition-all hover:scale-105 border border-slate-700"
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>

      <Footer theme={theme} />

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .article-content-dark {
          font-size: 1.125rem;
          line-height: 1.8;
          color: #d1d5db;
        }
        .article-content-dark h2 {
          font-size: 2rem;
          font-weight: 800;
          color: #ffffff;
          margin-top: 3rem;
          margin-bottom: 1.5rem;
        }
        .article-content-dark h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
          margin-top: 2.5rem;
          margin-bottom: 1.25rem;
        }
        .article-content-dark p {
          margin-bottom: 1.5rem;
          color: #d1d5db;
        }
        .article-content-dark a {
          color: #60a5fa;
          font-weight: 600;
          text-decoration: underline;
          transition: color 0.2s;
        }
        .article-content-dark a:hover {
          color: #93c5fd;
        }
        .article-content-dark img {
          border-radius: 1rem;
          margin: 2.5rem auto;
          max-width: 100%;
          height: auto;
        }
        .article-content-dark ul, .article-content-dark ol {
          margin: 1.5rem 0;
          padding-left: 1.75rem;
        }
        .article-content-dark li {
          margin-bottom: 0.75rem;
          color: #d1d5db;
        }
        .article-content-dark blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #9ca3af;
          background: rgba(30, 41, 59, 0.6);
          padding: 1.5rem;
          border-radius: 0.5rem;
          backdrop-filter: blur(10px);
        }
        .article-content-dark strong {
          font-weight: 700;
          color: #ffffff;
        }
        .article-content-dark code {
          background: rgba(30, 41, 59, 0.8);
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.9em;
          color: #fca5a5;
          font-weight: 600;
        }
        .article-image {
          width: 100%;
          max-width: 100%;
          height: auto;
          border-radius: 1rem;
          margin: 2.5rem auto;
          display: block;
        }
      `}</style>
    </div>
  );
}
