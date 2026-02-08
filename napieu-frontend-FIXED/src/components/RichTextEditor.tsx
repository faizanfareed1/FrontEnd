'use client';

import { useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');

  const insertImage = () => {
    if (!imageUrl) return;
    
    const imageHtml = `<img src="${imageUrl}" alt="${imageAlt || 'Article image'}" class="article-image" />`;
    onChange(value + '\n\n' + imageHtml + '\n\n');
    
    setImageUrl('');
    setImageAlt('');
    setShowImageDialog(false);
  };

  const insertHeading = (level: number) => {
    const heading = `<h${level}>Heading ${level}</h${level}>`;
    onChange(value + '\n\n' + heading + '\n\n');
  };

  const insertParagraph = () => {
    onChange(value + '\n\n<p>New paragraph...</p>\n\n');
  };

  const insertList = () => {
    const list = `<ul>
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>`;
    onChange(value + '\n\n' + list + '\n\n');
  };

  const insertLink = () => {
    const link = `<a href="https://example.com" target="_blank" rel="noopener noreferrer">Link text</a>`;
    onChange(value + link);
  };

  const insertQuote = () => {
    const quote = `<blockquote class="border-l-4 border-blue-500 pl-4 italic my-4">
  "Your quote here..."
</blockquote>`;
    onChange(value + '\n\n' + quote + '\n\n');
  };

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-300 rounded-t-lg">
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

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
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

              {imageUrl && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="w-full rounded-lg max-h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={insertImage}
                  disabled={!imageUrl}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Insert
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowImageDialog(false);
                    setImageUrl('');
                    setImageAlt('');
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

      {/* Editor Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={20}
        className="w-full px-4 py-3 border border-gray-300 rounded-b-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
        placeholder={placeholder || 'Write your article content here...'}
      />

      {/* Helper Text */}
      <div className="text-sm text-gray-600 space-y-1">
        <p>💡 <strong>Tips:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Use the toolbar buttons to insert formatted content</li>
          <li>You can add multiple images throughout your article</li>
          <li>HTML formatting is supported (bold: &lt;strong&gt;, italic: &lt;em&gt;)</li>
          <li>Images will be styled automatically on the article page</li>
        </ul>
      </div>
    </div>
  );
}