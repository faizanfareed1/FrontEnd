'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import React from 'react';
import { apiUrl } from '@/config/api';

// Auto-save hook
function useAutoSave({ data, onSave, delay = 30000, enabled = true }: any) {
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = React.useRef<string>('');
  const isSavingRef = React.useRef<boolean>(false);

  React.useEffect(() => {
    if (!enabled) return;

    const currentData = JSON.stringify(data);
    if (currentData === previousDataRef.current) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      if (isSavingRef.current) return;
      
      try {
        isSavingRef.current = true;
        await onSave(data);
        previousDataRef.current = currentData;
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        isSavingRef.current = false;
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, onSave, delay, enabled]);
}

interface Category {
  id: number;
  name: string;
  slug: string;
  color?: string;
}

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();

  const articleId =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : null;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageWidth, setImageWidth] = useState(50);

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

  // Auto-save to localStorage every 30 seconds
  useAutoSave({
    data: formData,
    onSave: async (data: typeof formData) => {
      if (articleId && (data.title || data.content)) {
        setAutoSaveStatus('saving');
        localStorage.setItem(`article-edit-${articleId}`, JSON.stringify(data));
        setLastSaved(new Date());
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      }
    },
    delay: 30000,
    enabled: true,
  });

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
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Not authenticated');
        router.push('/admin/login');
        return;
      }

      const response = await fetch(apiUrl(`/api/admin/articles/${id}`), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to load article');

      const data = await response.json();

      // Check for saved draft
      const savedDraft = localStorage.getItem(`article-edit-${id}`);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (confirm('📝 Found unsaved changes. Continue editing from draft?')) {
          setFormData(draft);
          setLastSaved(new Date());
          setFetching(false);
          return;
        }
      }

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

  const clearDraft = () => {
    if (articleId) {
      localStorage.removeItem(`article-edit-${articleId}`);
      setLastSaved(null);
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
    setFormData({ ...formData, title, slug: generateSlug(title) });

  const handleCategoryToggle = (id: number) =>
    setFormData((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((c) => c !== id)
        : [...prev.categoryIds, id],
    }));

  // Rich text toolbar functions
  const insertHeading = (level: number) => {
    const heading = `\n\n<h${level}>Heading ${level}</h${level}>\n\n`;
    setFormData({ ...formData, content: formData.content + heading });
  };

  const insertParagraph = () => {
    const paragraph = `\n\n<p>New paragraph...</p>\n\n`;
    setFormData({ ...formData, content: formData.content + paragraph });
  };

  const insertList = () => {
    const list = `\n\n<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n  <li>Item 3</li>\n</ul>\n\n`;
    setFormData({ ...formData, content: formData.content + list });
  };

  const insertLink = () => {
    const link = `<a href="https://example.com" target="_blank" rel="noopener noreferrer">Link text</a>`;
    setFormData({ ...formData, content: formData.content + link });
  };

  const insertQuote = () => {
    const quote = `\n\n<blockquote class="border-l-4 border-blue-500 pl-4 italic my-4">\n  "Your quote here..."\n</blockquote>\n\n`;
    setFormData({ ...formData, content: formData.content + quote });
  };

  const insertImage = () => {
    if (!imageUrl) return;
    
    const imageHtml = `\n\n<img src="${imageUrl}" alt="${imageAlt || 'Article image'}" style="width: ${imageWidth}%; max-width: 100%; height: auto;" class="article-image my-4 rounded-lg shadow-md mx-auto block" />\n\n`;
    setFormData({ ...formData, content: formData.content + imageHtml });
    
    setImageUrl('');
    setImageAlt('');
    setImageWidth(50);
    setShowImageDialog(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleId) return;
    
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(apiUrl(`/api/admin/articles/${articleId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(await response.text());

      alert('✅ Article updated successfully!');
      clearDraft();
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
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading article...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (confirm('⚠️ Discard unsaved changes and go back?')) {
                clearDraft();
                router.push('/admin/articles');
              }
            }}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Article</h1>
            <p className="text-gray-600 mt-1">Update your blog post</p>
          </div>
        </div>

        {/* Auto-save Status */}
        <div className="flex items-center gap-3">
          {autoSaveStatus === 'saving' && (
            <span className="text-sm text-blue-600 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              Saving...
            </span>
          )}
          {autoSaveStatus === 'saved' && lastSaved && (
            <span className="text-sm text-green-600 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          {autoSaveStatus === 'idle' && lastSaved && (
            <span className="text-sm text-gray-500">
              💾 Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                placeholder="Enter article title..."
              />
            </div>

            {/* Slug */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">/articles/</span>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="auto-generated-from-title"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt
              </label>
              <textarea
                rows={3}
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Short description..."
              />
            </div>

            {/* Content with Rich Text Toolbar */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              
              {/* Toolbar */}
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-300 rounded-t-lg mb-0">
                <button
                  type="button"
                  onClick={() => insertHeading(2)}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm font-semibold"
                  title="Insert Heading 2"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertHeading(3)}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm font-semibold"
                  title="Insert Heading 3"
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={insertParagraph}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
                  title="Insert Paragraph"
                >
                  ¶ P
                </button>
                <button
                  type="button"
                  onClick={insertList}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
                  title="Insert List"
                >
                  • List
                </button>
                <button
                  type="button"
                  onClick={insertLink}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
                  title="Insert Link"
                >
                  🔗 Link
                </button>
                <button
                  type="button"
                  onClick={insertQuote}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
                  title="Insert Quote"
                >
                  " Quote
                </button>
                <button
                  type="button"
                  onClick={() => setShowImageDialog(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white border border-blue-600 rounded hover:bg-blue-700 text-sm font-medium"
                  title="Insert Image"
                >
                  🖼️ Image
                </button>
              </div>

              <textarea
                rows={20}
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 border-t-0 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Write your article content in HTML..."
              />
              <p className="text-sm text-gray-500 mt-2">
                💡 Use toolbar buttons to insert formatted content. Multiple images supported!
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium text-gray-900 mb-4">Publish Status</h3>
              <div className="space-y-4">
                <label className="flex items-center p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 font-medium">
                    {formData.published ? '✅ Published' : '📝 Draft'}
                  </span>
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold shadow-md hover:shadow-lg"
                >
                  <Save size={20} />
                  {loading ? '⏳ Saving...' : '💾 Update Article'}
                </button>
              </div>
            </div>

            {/* Author */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium text-gray-900 mb-4">Author</h3>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Read Time */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium text-gray-900 mb-4">Read Time (minutes)</h3>
              <input
                type="number"
                value={formData.readTime}
                onChange={(e) => setFormData({ ...formData, readTime: parseInt(e.target.value) || 5 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>

            {/* Featured Image */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon size={18} />
                Featured Image URL
              </h3>
              <input
                type="text"
                value={formData.featuredImage}
                onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
              {formData.featuredImage && (
                <div className="mt-3">
                  <img 
                    src={formData.featuredImage} 
                    alt="Featured preview" 
                    className="w-full rounded-lg max-h-48 object-cover shadow-sm"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Source */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium text-gray-900 mb-4">Source URL</h3>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={formData.categoryIds.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span 
                      className="ml-2 px-2 py-1 rounded text-xs text-white font-medium"
                      style={{ backgroundColor: category.color || '#3b82f6' }}
                    >
                      {category.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Image Insert Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
            <h3 className="text-xl font-bold mb-4">Insert Image</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL *
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://example.com/image.jpg"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alt Text (Description)
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Description of the image"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Width: {imageWidth}%
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={imageWidth}
                  onChange={(e) => setImageWidth(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>20% (Small)</span>
                  <span>50% (Medium)</span>
                  <span>100% (Full)</span>
                </div>
              </div>

              {imageUrl && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview ({imageWidth}% width):</p>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      style={{ width: `${imageWidth}%`, maxWidth: '100%' }}
                      className="rounded-lg mx-auto block"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={insertImage}
                  disabled={!imageUrl}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
                >
                  Insert Image
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowImageDialog(false);
                    setImageUrl('');
                    setImageAlt('');
                    setImageWidth(50);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}