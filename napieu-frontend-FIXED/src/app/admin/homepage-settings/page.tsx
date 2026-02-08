'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, Zap, Star, MessageSquareQuote, Mail, 
  ArrowLeft, Gauge, TrendingUp, AlertCircle, CheckCircle 
} from 'lucide-react';
import { apiUrl } from '@/config/api';

interface Article {
  id: number;
  title: string;
  slug: string;
}

export default function HomepageSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);

  // Breaking News
  const [showBreakingNews, setShowBreakingNews] = useState(false);
  const [breakingNewsArticleId, setBreakingNewsArticleId] = useState<number | null>(null);
  const [breakingNewsCustomText, setBreakingNewsCustomText] = useState('');

  // Featured Article
  const [featuredArticleId, setFeaturedArticleId] = useState<number | null>(null);

  // Editor's Picks
  const [editorsPicksIds, setEditorsPicksIds] = useState<number[]>([]);

  // Quote
  const [showQuote, setShowQuote] = useState(false);
  const [quoteText, setQuoteText] = useState('');
  const [quoteAuthor, setQuoteAuthor] = useState('');

  // Newsletter
  const [showNewsletter, setShowNewsletter] = useState(true);
  const [newsletterTitle, setNewsletterTitle] = useState('Stay Updated');
  const [newsletterDescription, setNewsletterDescription] = useState('Get the latest news delivered to your inbox');

  // Ticker Speed
  const [tickerSpeed, setTickerSpeed] = useState(50);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [articlesRes, settingsRes] = await Promise.all([
        fetch(apiUrl('/api/articles')),
        fetch(apiUrl('/api/homepage-settings'))
      ]);

      if (articlesRes.ok) {
        const data = await articlesRes.json();
        setArticles(data.content || data);
      }

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        console.log('🔧 ADMIN: Settings loaded from API:', data);
        console.log('🔧 ADMIN: editorsPicksIds:', data.editorsPicksIds);
        
        setShowBreakingNews(data.showBreakingNews || false);
        setBreakingNewsArticleId(data.breakingNewsArticleId || null);
        setBreakingNewsCustomText(data.breakingNewsCustomText || '');
        setFeaturedArticleId(data.featuredArticleId || null);
        
        // Set editor's picks
        const ids = data.editorsPicksIds || [];
        console.log('🔧 ADMIN: Setting editorsPicksIds to:', ids);
        setEditorsPicksIds(ids);
        
        setShowQuote(data.showQuote || false);
        setQuoteText(data.quoteText || '');
        setQuoteAuthor(data.quoteAuthor || '');
        setShowNewsletter(data.showNewsletter !== undefined ? data.showNewsletter : true);
        setNewsletterTitle(data.newsletterTitle || 'Stay Updated');
        setNewsletterDescription(data.newsletterDescription || 'Get the latest news delivered to your inbox');
        setTickerSpeed(data.tickerSpeed || 50);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    console.log('🔧 ADMIN: Saving homepage settings...');
    console.log('🔧 ADMIN: Current editorsPicksIds state:', editorsPicksIds);
    setSaving(true);
    setMessage(null);

    const payload = {
      showBreakingNews,
      breakingNewsArticleId,
      breakingNewsCustomText,
      featuredArticleId,
      editorsPicksIds, // THIS IS THE KEY FIELD!
      showQuote,
      quoteText,
      quoteAuthor,
      showNewsletter,
      newsletterTitle,
      newsletterDescription,
      tickerSpeed
    };

    console.log('🔧 ADMIN: Payload being sent:', JSON.stringify(payload, null, 2));

    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(apiUrl('/api/homepage-settings'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      console.log('🔧 ADMIN: Response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('🔧 ADMIN: Response data:', responseData);
        console.log('🔧 ADMIN: Saved editorsPicksIds:', responseData.editorsPicksIds);
        
        setMessage({ type: 'success', text: `✅ Settings saved! Editor picks: ${editorsPicksIds.length} selected` });
        setTimeout(() => setMessage(null), 5000);
      } else {
        const errorText = await response.text();
        console.error('🔧 ADMIN: Error response:', errorText);
        setMessage({ type: 'error', text: `❌ Failed to save: ${response.status}` });
      }
    } catch (error) {
      console.error('🔧 ADMIN: Failed to save settings:', error);
      setMessage({ type: 'error', text: '❌ Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const toggleEditorsPick = (articleId: number) => {
    console.log('🔧 ADMIN: Toggle editor pick:', articleId);
    console.log('🔧 ADMIN: Current picks:', editorsPicksIds);
    
    if (editorsPicksIds.includes(articleId)) {
      const newPicks = editorsPicksIds.filter(id => id !== articleId);
      console.log('🔧 ADMIN: Removing, new picks:', newPicks);
      setEditorsPicksIds(newPicks);
    } else {
      if (editorsPicksIds.length < 6) {
        const newPicks = [...editorsPicksIds, articleId];
        console.log('🔧 ADMIN: Adding, new picks:', newPicks);
        setEditorsPicksIds(newPicks);
      } else {
        alert('You can only select up to 6 articles');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header with SINGLE save button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-800 rounded-lg transition"
            >
              <ArrowLeft size={24} className="text-white" />
            </button>
            <h1 className="text-3xl font-black text-white">Homepage Settings</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="font-semibold">{message.text}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Ticker Speed */}
          <section className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Gauge size={24} className="text-blue-500" />
              <h2 className="text-2xl font-bold text-white">News Ticker Speed</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Speed: {tickerSpeed} {tickerSpeed < 30 ? '(Slow)' : tickerSpeed > 70 ? '(Fast)' : '(Normal)'}
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={tickerSpeed}
                  onChange={(e) => setTickerSpeed(Number(e.target.value))}
                  className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>10 (Slowest)</span>
                  <span>50 (Default)</span>
                  <span>100 (Fastest)</span>
                </div>
              </div>
            </div>
          </section>

          {/* Breaking News */}
          <section className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Zap size={24} className="text-red-500" />
              <h2 className="text-2xl font-bold text-white">Breaking News Banner</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBreakingNews}
                  onChange={(e) => setShowBreakingNews(e.target.checked)}
                  className="w-5 h-5 accent-blue-600"
                />
                <span className="text-white font-semibold">Show Breaking News Banner</span>
              </label>

              {showBreakingNews && (
                <>
                  <div>
                    <label className="block text-white font-semibold mb-2">Select Article</label>
                    <select
                      value={breakingNewsArticleId || ''}
                      onChange={(e) => setBreakingNewsArticleId(Number(e.target.value) || null)}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-white rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select an article</option>
                      {articles.map((article) => (
                        <option key={article.id} value={article.id}>
                          {article.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Custom Text (Optional)
                    </label>
                    <input
                      type="text"
                      value={breakingNewsCustomText}
                      onChange={(e) => setBreakingNewsCustomText(e.target.value)}
                      placeholder="Leave empty to use article title"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-white rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Featured Article */}
          <section className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Star size={24} className="text-yellow-500" />
              <h2 className="text-2xl font-bold text-white">Featured Article (Hero)</h2>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Select Featured Article</label>
              <select
                value={featuredArticleId || ''}
                onChange={(e) => setFeaturedArticleId(Number(e.target.value) || null)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-white rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="">Latest article (default)</option>
                {articles.map((article) => (
                  <option key={article.id} value={article.id}>
                    {article.title}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Editor's Picks - WITH DEBUG */}
          <section className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Star size={24} className="text-yellow-500" />
              <h2 className="text-2xl font-bold text-white">Editor's Picks</h2>
              <span className="text-sm text-gray-400">
                ({editorsPicksIds.length}/6 selected)
                {editorsPicksIds.length > 0 && ` - IDs: [${editorsPicksIds.join(', ')}]`}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {articles.map((article) => (
                <label
                  key={article.id}
                  className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer transition ${
                    editorsPicksIds.includes(article.id)
                      ? 'bg-blue-900 border-2 border-blue-600'
                      : 'bg-slate-900 border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={editorsPicksIds.includes(article.id)}
                    onChange={() => toggleEditorsPick(article.id)}
                    className="mt-1 w-4 h-4 accent-blue-600"
                  />
                  <span className="text-white text-sm">
                    #{article.id}: {article.title}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Quote Section */}
          <section className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquareQuote size={24} className="text-blue-500" />
              <h2 className="text-2xl font-bold text-white">Quote Section</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showQuote}
                  onChange={(e) => setShowQuote(e.target.checked)}
                  className="w-5 h-5 accent-blue-600"
                />
                <span className="text-white font-semibold">Show Quote Section</span>
              </label>

              {showQuote && (
                <>
                  <div>
                    <label className="block text-white font-semibold mb-2">Quote Text</label>
                    <textarea
                      value={quoteText}
                      onChange={(e) => setQuoteText(e.target.value)}
                      placeholder="Enter inspirational quote..."
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-white rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Author</label>
                    <input
                      type="text"
                      value={quoteAuthor}
                      onChange={(e) => setQuoteAuthor(e.target.value)}
                      placeholder="Author name"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-white rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Newsletter Section */}
          <section className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Mail size={24} className="text-white" />
              <h2 className="text-2xl font-bold text-white">Newsletter Section</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showNewsletter}
                  onChange={(e) => setShowNewsletter(e.target.checked)}
                  className="w-5 h-5 accent-blue-600"
                />
                <span className="text-white font-semibold">Show Newsletter Section</span>
              </label>

              {showNewsletter && (
                <>
                  <div>
                    <label className="block text-white font-semibold mb-2">Newsletter Title</label>
                    <input
                      type="text"
                      value={newsletterTitle}
                      onChange={(e) => setNewsletterTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-white rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Newsletter Description</label>
                    <textarea
                      value={newsletterDescription}
                      onChange={(e) => setNewsletterDescription(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-white rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}