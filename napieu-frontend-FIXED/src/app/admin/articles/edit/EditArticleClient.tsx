'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import { apiUrl } from '@/config/api';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface EditArticleClientProps {
  articleId: string;
}

export default function EditArticleClient({ articleId }: EditArticleClientProps) {
  const router = useRouter();

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
        router.push('/admin/login');
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
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Article Title"
            required
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slug
          </label>
          <input
            value={formData.slug}
            onChange={(e) =>
              setFormData({ ...formData, slug: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
            placeholder="article-slug"
            required
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Excerpt
          </label>
          <textarea
            value={formData.excerpt}
            onChange={(e) =>
              setFormData({ ...formData, excerpt: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief description..."
            rows={3}
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <textarea
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="Article content (HTML supported)..."
            rows={20}
            required
          />
        </div>

        {/* Author & Read Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Author
            </label>
            <input
              value={formData.author}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Author name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Read Time (minutes)
            </label>
            <input
              type="number"
              value={formData.readTime}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  readTime: parseInt(e.target.value) || 5,
                })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              required
            />
          </div>
        </div>

        {/* Featured Image & Source */}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image URL
            </label>
            <input
              value={formData.featuredImage}
              onChange={(e) =>
                setFormData({ ...formData, featuredImage: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source URL
            </label>
            <input
              value={formData.source}
              onChange={(e) =>
                setFormData({ ...formData, source: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://source.com/article"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-medium text-gray-900 mb-4">Categories</h3>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryToggle(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  formData.categoryIds.includes(category.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

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

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save size={20} />
            {loading ? 'Updating...' : 'Update Article'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/admin/articles')}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}