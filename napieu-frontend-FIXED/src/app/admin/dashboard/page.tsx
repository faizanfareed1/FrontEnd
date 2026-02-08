'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Eye, 
  Palette, 
  Layout, 
  Image as ImageIcon,
  Plus,
  TrendingUp 
} from 'lucide-react';
import type { Article } from '@/types';
import { apiUrl } from '@/config/api';

interface PaginatedResponse {
  content: Article[];
  totalElements: number;
  totalPages: number;
}

export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(apiUrl('/api/articles'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const articlesList = Array.isArray(data) ? data : data.content || [];
        setArticles(articlesList);
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = articles.length > 0 ? {
    total: articles.length,
    published: articles.filter((a: Article) => a.published).length,
    drafts: articles.filter((a: Article) => !a.published).length,
    totalViews: articles.reduce((sum: number, a: Article) => sum + (a.views || 0), 0),
  } : {
    total: 0,
    published: 0,
    drafts: 0,
    totalViews: 0
  };

  const recentArticles = articles.length > 0
    ? articles
        .sort((a: Article, b: Article) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
        .slice(0, 5)
    : [];

  const topArticles = articles.length > 0
    ? articles
        .sort((a: Article, b: Article) => (b.views || 0) - (a.views || 0))
        .slice(0, 5)
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back!</p>
            </div>
            <Link
              href="/admin/articles/create"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              New Article
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            value={stats.total}
            label="Total Articles"
            icon={<FileText size={24} />}
            color="bg-blue-500"
          />
          <StatCard
            value={stats.published}
            label="Published"
            icon={<Eye size={24} />}
            color="bg-green-500"
          />
          <StatCard
            value={stats.drafts}
            label="Drafts"
            icon={<FileText size={24} />}
            color="bg-yellow-500"
          />
          <StatCard
            value={stats.totalViews}
            label="Total Views"
            icon={<TrendingUp size={24} />}
            color="bg-purple-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionCard
              href="/admin/articles/create"
              icon={<Plus size={20} />}
              label="New Article"
              color="bg-blue-500"
            />
            <QuickActionCard
              href="/admin/categories"
              icon={<Layout size={20} />}
              label="Categories"
              color="bg-purple-500"
            />
            <QuickActionCard
              href="/admin/theme"
              icon={<Palette size={20} />}
              label="Theme"
              color="bg-pink-500"
            />
            <QuickActionCard
              href="/admin/media"
              icon={<ImageIcon size={20} />}
              label="Media Library"
              color="bg-green-500"
            />
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Articles */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Articles</h2>
              <Link
                href="/admin/articles"
                className="text-sm text-blue-600 hover:underline"
              >
                View All
              </Link>
            </div>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : recentArticles && recentArticles.length > 0 ? (
              <div className="space-y-3">
                {recentArticles.map((article: Article) => (
                  <Link
                    key={article.id}
                    href={`/admin/articles/edit/${article.slug}`}
                    className="block p-3 hover:bg-gray-50 rounded-lg transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <h3 className="font-medium line-clamp-1">{article.title}</h3>
                        <p className="text-sm text-gray-500">
                          {article.author} • {article.views || 0} views
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        article.published 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {article.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p>No articles yet</p>
                <Link
                  href="/admin/articles/create"
                  className="text-blue-600 hover:underline mt-2 inline-block"
                >
                  Create your first article
                </Link>
              </div>
            )}
          </div>

          {/* Top Performing */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <TrendingUp size={20} />
                Top Performing
              </h2>
            </div>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : topArticles && topArticles.length > 0 ? (
              <div className="space-y-3">
                {topArticles.map((article: Article, index: number) => (
                  <Link
                    key={article.id}
                    href={`/admin/articles/edit/${article.slug}`}
                    className="block p-3 hover:bg-gray-50 rounded-lg transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium line-clamp-1">{article.title}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Eye size={14} />
                          {(article.views || 0).toLocaleString()} views
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
                <p>No analytics yet</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

interface StatCardProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ value, label, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{label}</p>
          <p className="text-3xl font-bold mt-2">{value.toLocaleString()}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  color: string;
}

function QuickActionCard({ href, icon, label, color }: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex flex-col items-center gap-2">
        <div className={`${color} text-white p-3 rounded-lg`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-center">{label}</span>
      </div>
    </Link>
  );
}