'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Save, X } from 'lucide-react';
import { apiUrl } from '@/config/api';


interface Ticker {
  id?: number;
  text: string;
  linkUrl: string;
  isActive: boolean;
  priority: number;
  icon: string;
  expiresAt: string;
}

export default function LiveTickerAdminPage() {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Ticker>({
    text: '',
    linkUrl: '',
    isActive: true,
    priority: 0,
    icon: '🔴',
    expiresAt: '',
  });

  useEffect(() => {
    fetchTickers();
  }, []);

  const fetchTickers = async () => {
    try {
      console.log('Fetching tickers...');
      const res = await fetch(apiUrl('/api/live-ticker'));
      console.log('Response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Tickers loaded:', data);
        setTickers(data);
      } else {
        const errorText = await res.text();
        console.error('Failed to fetch tickers:', res.status, errorText);
        alert(`Failed to fetch: ${res.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Failed to fetch tickers:', error);
      alert('Failed to fetch tickers: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingId
        ? apiUrl(`/api/live-ticker/${editingId}`)
        : apiUrl('/api/live-ticker');
      
      const method = editingId ? 'PUT' : 'POST';
      
      console.log('Submitting ticker:', { url, method, formData });
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response:', res.status);

      if (res.ok) {
        await fetchTickers();
        resetForm();
        alert(editingId ? 'Ticker updated!' : 'Ticker created!');
      } else {
        const errorText = await res.text();
        console.error('Error response:', errorText);
        alert(`Failed to save ticker: ${res.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Failed to save ticker:', error);
      alert('Failed to save ticker: ' + error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this ticker?')) return;

    try {
      const res = await fetch(apiUrl(`/api/live-ticker/${id}`), {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchTickers();
        alert('Ticker deleted!');
      } else {
        const errorText = await res.text();
        alert(`Failed to delete: ${res.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Failed to delete ticker:', error);
      alert('Failed to delete ticker: ' + error);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const res = await fetch(apiUrl(`/api/live-ticker/${id}/toggle`), {
        method: 'PATCH',
      });

      if (res.ok) {
        await fetchTickers();
      } else {
        const errorText = await res.text();
        alert(`Failed to toggle: ${res.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Failed to toggle ticker:', error);
      alert('Failed to toggle: ' + error);
    }
  };

  const handleEdit = (ticker: Ticker) => {
    setEditingId(ticker.id!);
    setFormData({
      text: ticker.text,
      linkUrl: ticker.linkUrl || '',
      isActive: ticker.isActive,
      priority: ticker.priority,
      icon: ticker.icon,
      expiresAt: ticker.expiresAt || '',
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      text: '',
      linkUrl: '',
      isActive: true,
      priority: 0,
      icon: '🔴',
      expiresAt: '',
    });
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Live News Ticker Management</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? 'Edit Ticker' : 'Create New Ticker'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Ticker Text *
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                  maxLength={300}
                  required
                  placeholder="EU announces sanctions • France elects PM..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.text.length}/300 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Link URL (optional)
                </label>
                <input
                  type="text"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="/articles/slug or full URL"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Icon</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="🔴"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Priority</label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Higher = shows first</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Expires At (optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">Auto-hide after this date</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm font-semibold">
                  Active (show on site)
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Save size={18} />
                  {editingId ? 'Update' : 'Create'}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Active Tickers ({tickers.length})</h2>

            <div className="space-y-3">
              {tickers.map((ticker) => (
                <div
                  key={ticker.id}
                  className={`border rounded-lg p-4 ${
                    ticker.isActive ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{ticker.icon}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          ticker.isActive ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'
                        }`}>
                          {ticker.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
                          Priority: {ticker.priority}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{ticker.text}</p>
                      {ticker.linkUrl && (
                        <p className="text-xs text-blue-600">🔗 {ticker.linkUrl}</p>
                      )}
                      {ticker.expiresAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          ⏱️ Expires: {new Date(ticker.expiresAt).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggle(ticker.id!)}
                        className="p-2 hover:bg-gray-200 rounded transition"
                        title={ticker.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {ticker.isActive ? (
                          <ToggleRight size={20} className="text-green-600" />
                        ) : (
                          <ToggleLeft size={20} className="text-gray-400" />
                        )}
                      </button>

                      <button
                        onClick={() => handleEdit(ticker)}
                        className="p-2 hover:bg-blue-100 rounded transition"
                        title="Edit"
                      >
                        <Edit2 size={18} className="text-blue-600" />
                      </button>

                      <button
                        onClick={() => handleDelete(ticker.id!)}
                        className="p-2 hover:bg-red-100 rounded transition"
                        title="Delete"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {tickers.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No tickers yet. Create one above!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}