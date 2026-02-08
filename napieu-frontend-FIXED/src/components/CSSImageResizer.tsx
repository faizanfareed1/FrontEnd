import { useState } from 'react';
import { Image as ImageIcon, Info } from 'lucide-react';

interface CSSImageResizerProps {
  imageUrl: string;
  onUrlChange: (newUrl: string) => void;
  onSizeChange?: (width: number, height: number) => void;
  label?: string;
}

export default function CSSImageResizer({ 
  imageUrl, 
  onUrlChange, 
  onSizeChange,
  label = "Image URL" 
}: CSSImageResizerProps) {
  const [width, setWidth] = useState('200');
  const [height, setHeight] = useState('0');
  const [displayWidth, setDisplayWidth] = useState('200');
  const [displayHeight, setDisplayHeight] = useState('0');

  const handleApplyResize = () => {
    // Store the display dimensions (these will be used in CSS)
    setDisplayWidth(width || '0');
    setDisplayHeight(height || '0');
    
    // Call the callback if provided
    if (onSizeChange) {
      onSizeChange(parseInt(width) || 0, parseInt(height) || 0);
    }
    
    // Show feedback
    alert(`Display size set to ${width || 'auto'}px × ${height || 'auto'}px (CSS-based)`);
  };

  const handleCopyStyle = () => {
    const w = width || 'auto';
    const h = height || 'auto';
    const style = `width: ${w}px; height: ${h === '0' ? 'auto' : h + 'px'}; object-fit: contain;`;
    navigator.clipboard.writeText(style);
    alert('CSS style copied to clipboard!');
  };

  const getPreviewStyle = () => {
    const w = parseInt(displayWidth) || 0;
    const h = parseInt(displayHeight) || 0;
    
    const style: React.CSSProperties = {
      maxWidth: '100%',
      maxHeight: '200px',
      objectFit: 'contain'
    };
    
    if (w > 0) {
      style.width = `${w}px`;
    }
    if (h > 0 && h !== 0) {
      style.height = `${h}px`;
    } else if (w > 0) {
      style.height = 'auto';
    }
    
    return style;
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type="text"
        value={imageUrl}
        onChange={(e) => onUrlChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="https://example.com/image.jpg or /uploads/image.png"
      />

      {/* CSS Resize Controls */}
      {imageUrl && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon size={18} className="text-blue-600" />
            <h4 className="font-semibold text-sm text-blue-900">CSS Display Size</h4>
            <div className="ml-auto">
              <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                Frontend Only
              </span>
            </div>
          </div>

          <div className="mb-3 p-3 bg-white border border-blue-300 rounded-lg">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-semibold mb-1">CSS-Based Resizing (No Backend Needed)</p>
                <p>Original image stays the same size on server. Display size changes in browser using CSS.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-gray-700 font-medium mb-1">Display Width (px)</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="Auto (0)"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 font-medium mb-1">Display Height (px)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="Auto (0)"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={handleApplyResize}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition"
            >
              Apply Display Size
            </button>
            <button
              type="button"
              onClick={handleCopyStyle}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition"
            >
              Copy CSS
            </button>
          </div>

          {/* Quick Presets */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Quick Presets:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Tiny (50px)', w: '50', h: '0' },
                { label: 'Small (150px)', w: '150', h: '0' },
                { label: 'Medium (300px)', w: '300', h: '0' },
                { label: 'Large (600px)', w: '600', h: '0' },
                { label: 'Square 100', w: '100', h: '100' },
                { label: 'Square 200', w: '200', h: '200' },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setWidth(preset.w);
                    setHeight(preset.h);
                  }}
                  className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Preview {displayWidth !== '0' && `(${displayWidth}px ${displayHeight === '0' ? '× auto' : `× ${displayHeight}px`})`}:
            </p>
            <div className="bg-white border border-gray-300 rounded p-4 flex items-center justify-center min-h-[100px]">
              <img
                src={imageUrl}
                alt="Preview"
                style={getPreviewStyle()}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLElement).parentElement;
                  if (parent) {
                    parent.innerHTML += '<span class="text-gray-400 text-sm">Failed to load image</span>';
                  }
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 This is how the image will display in your site
            </p>
          </div>

          {/* CSS Code Display */}
          <div className="mt-3 p-3 bg-gray-900 rounded-lg">
            <p className="text-xs font-semibold text-gray-300 mb-2">Generated CSS:</p>
            <code className="text-xs text-green-400 font-mono">
              {`width: ${width || 'auto'}px;`}<br/>
              {`height: ${height === '0' ? 'auto' : (height || 'auto') + 'px'};`}<br/>
              {`object-fit: contain;`}
            </code>
          </div>
        </div>
      )}
    </div>
  );
}