'use client';

import { useEffect, useState, useRef } from 'react';
import { Upload, Trash2, Copy, Search, Image as ImageIcon } from 'lucide-react';
import { apiUrl } from '@/config/api';

interface MediaFile {
  id: number;
  filename: string;
  originalFilename: string;
  url: string;
  fileType: string;
  fileSize: number;
  width: number;
  height: number;
  alt: string;
  caption: string;
  createdAt: string;
}

const normalizeMediaUrl = (url: string) => {
  if (!url) return '';

  if (url.includes('localhost')) {
    url = url.replace(/^http:\/\/localhost:\d+/, apiUrl(''));
  }

  if (url.startsWith('/')) {
    url = apiUrl(url);
  }

  // Add cache-busting timestamp to force reload
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
};

export default function MediaPage() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(apiUrl('/api/media'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMedia(data);
      }
    } catch (error) {
      console.error('Failed to fetch media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const token = localStorage.getItem('accessToken');

    try {
      for (const file of Array.from(files)) {
        try {
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch(apiUrl('/api/media/upload'), {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          if (!response.ok) {
            alert(`Failed to upload ${file.name}`);
          } else {
            // Wait a bit for backend to process
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.error('Upload error:', error);
          alert(`Error uploading ${file.name}`);
        }
      }

      // Wait a bit more before refreshing
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchMedia();
      
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      await fetch(apiUrl(`/api/media/${id}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchMedia();
      if (selectedFile?.id === id) setSelectedFile(null);
    } catch (error) {
      console.error('Failed to delete media:', error);
      alert('Failed to delete file');
    }
  };

  const copyUrl = (url: string) => {
    const fixedUrl = normalizeMediaUrl(url);
    navigator.clipboard.writeText(fixedUrl);
    alert('URL copied to clipboard!');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const filteredMedia = media.filter(
    (file) =>
      file.originalFilename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.alt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading media...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600 mt-1">Upload and manage your images</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className={`flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Upload size={20} />
            {uploading ? 'Uploading...' : 'Upload Images'}
          </label>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredMedia.map((file) => (
              <div
                key={`${file.id}-${file.createdAt}`}
                onClick={() => setSelectedFile(file)}
                className="relative cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200 hover:border-gray-300"
              >
                <div className="aspect-square bg-gray-100">
                  <img
                    key={`img-${file.id}-${Date.now()}`}
                    src={normalizeMediaUrl(file.url)}
                    alt={file.alt || file.originalFilename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-black/70 p-2 text-white text-xs truncate">
                  {file.originalFilename}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(file.id);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-8 h-fit">
          {selectedFile ? (
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={normalizeMediaUrl(selectedFile.url)}
                  alt={selectedFile.alt || selectedFile.originalFilename}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="text-sm space-y-2">
                <p><strong>Filename:</strong> {selectedFile.originalFilename}</p>
                <p><strong>Dimensions:</strong> {selectedFile.width} × {selectedFile.height}px</p>
                <p><strong>Size:</strong> {formatFileSize(selectedFile.fileSize)}</p>

                <div className="flex gap-2">
                  <input
                    readOnly
                    value={normalizeMediaUrl(selectedFile.url)}
                    className="flex-1 px-2 py-1 border rounded font-mono text-xs"
                  />
                  <button
                    onClick={() => copyUrl(selectedFile.url)}
                    className="bg-blue-600 text-white px-3 rounded"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Select an image
            </div>
          )}
        </div>
      </div>
    </div>
  );
}