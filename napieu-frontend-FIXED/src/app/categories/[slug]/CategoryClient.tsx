'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiUrl } from '@/config/api';

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  readTime: number;
  featuredImage: string;
  categories: Array<{ name: string; color: string }>;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
}

interface CategoryClientProps {
  category: Category | null;
  articles: Article[];
  error: string;
}

export default function CategoryClient({ category: initialCategory, articles: initialArticles, error: initialError }: CategoryClientProps) {
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(initialCategory);
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [theme, setTheme] = useState<any>(null);
  const [error, setError] = useState(initialError);

  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    try {
      const response = await fetch(apiUrl('/api/themes/active'));
      if (response.ok) {
        const data = await response.json();
        setTheme(data);
      }
    } catch (error) {
      console.error('Failed to fetch theme:', error);
    }
  };

  if (error || !category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header theme={theme} />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{error || 'Category not found'}</h1>
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mx-auto"
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header theme={theme} />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          {/* Category Header */}
          <div className="mb-12">
            <div 
              className="inline-block px-4 py-2 rounded-full text-white font-medium mb-4"
              style={{ backgroundColor: category.color || '#3b82f6' }}
            >
              {category.name}
            </div>
            {category.description && (
              <p className="text-xl text-gray-600 max-w-3xl">
                {category.description}
              </p>
            )}
            <p className="text-gray-500 mt-4">
              {articles.length} {articles.length === 1 ? 'article' : 'articles'}
            </p>
          </div>

          {/* Articles Grid */}
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No articles in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <article
                  key={article.id}
                  onClick={() => router.push(`/articles/${article.slug}`)}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                >
                  {/* Featured Image */}
                  {article.featuredImage && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
                      {article.title}
                    </h2>

                    {/* Excerpt */}
                    {article.excerpt && (
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{article.readTime} min</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer theme={theme} />
    </div>
  );
}
