'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import { apiUrl } from '@/config/api';

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();

  // ✅ SAFE param handling
  const articleId =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : null;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    author: 'NapiEU',
    readTime: 5,
    published: false,
    featuredImage: '',
    source: '',
    categoryIds: [] as number[],
  });

  useEffect(() => {
    if (!articleId) return;

    fetchCategories();
    fetchArticle(articleId);
  }, [articleId]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(apiUrl('/api/categories'));
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchArticle = async (id: string) => {
    try {
      if (typeof window === 'undefined') return;

      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Not authenticated');
        router.push('/login');
        return;
      }

      const response = await fetch(
        apiUrl(`/api/admin/articles/${id}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load article');
      }

      const data = await response.json();

      setFormData({
        title: data.title ?? '',
        slug: data.slug ?? '',
        content: data.content ?? '',
        excerpt: data.excerpt ?? '',
        author: data.author ?? 'NapiEU',
        readTime: data.readTime ?? 5,
        published: data.published ?? false,
        featuredImage: data.featuredImage ?? '',
        source: data.source ?? '',
        categoryIds: data.categories?.map((c: any) => c.id) ?? [],
      });
    } catch (error) {
      console.error(error);
      alert('Failed to load article');
      router.push('/admin/articles');
    } finally {
      setFetching(false);
    }
  };

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[áàâä]/g, 'a')
      .replace(/[éèêë]/g, 'e')
      .replace(/[íìîï]/g, 'i')
      .replace(/[óòôöő]/g, 'o')
      .replace(/[úùûüű]/g, 'u')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const handleTitleChange = (title: string) =>
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));

  const handleCategoryToggle = (id: number) =>
    setFormData((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((c) => c !== id)
        : [...prev.categoryIds, id],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!articleId) return;

    try {
      const token = localStorage.getItem('accessToken');

      const response = await fetch(
        apiUrl(`/api/admin/articles/${articleId}`),
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      alert('Article updated successfully!');
      router.push('/admin/articles');
    } catch (error) {
      alert('Failed to update article');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => router.push('/admin/articles')}
          className="p-2 hover:bg-gray-200 rounded-lg"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold">Edit Article</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Title"
          required
        />

        <textarea
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          className="w-full p-2 border rounded h-64"
          required
        />

        {/* Publish */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-medium text-gray-900 mb-4">Publish</h3>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) =>
                setFormData({ ...formData, published: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Publish immediately
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded"
        >
          {loading ? 'Updating...' : 'Update Article'}
        </button>
      </form>
    </div>
  );
}
