'use client';

import { useEffect, useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { apiUrl } from '@/config/api';
interface Theme {
  id?: number;
  name: string;
  isActive: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  fontSizeBase: number;
  headingFontSize: number;
  bodyFontSize: number;
  maxWidth: number;
  headerStyle: string;
  cardStyle: string;
  logoUrl: string;
  logoWidth?: number;
  logoHeight?: number;
  siteTitle: string;
  siteTagline: string;
  customCss: string;
}

export default function ThemePage() {
  const [theme, setTheme] = useState<Theme>({
    name: 'Default',
    isActive: true,
    primaryColor: '#1a1a1a',
    secondaryColor: '#ffffff',
    accentColor: '#ff6b35',
    backgroundColor: '#f5f5f5',
    textColor: '#1a1a1a',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    fontSizeBase: 16,
    headingFontSize: 32,
    bodyFontSize: 16,
    maxWidth: 1280,
    headerStyle: 'default',
    cardStyle: 'elevated',
    logoUrl: '',
    logoWidth: 40,
    logoHeight: 40,
    siteTitle: 'NapiEU',
    siteTagline: 'Hungarian Politics & EU Affairs',
    customCss: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchActiveTheme();
  }, []);

  const fetchActiveTheme = async () => {
    try {
      const response = await fetch(apiUrl('/api/themes/active'));
      if (response.ok) {
        const data = await response.json();
        // Ensure all string fields have at least empty string (not null/undefined)
        setTheme({
          ...data,
          logoUrl: data.logoUrl || '',
          siteTitle: data.siteTitle || 'NapiEU',
          siteTagline: data.siteTagline || 'Hungarian Politics & EU Affairs',
          customCss: data.customCss || '',
          backgroundColor: data.backgroundColor || '#f5f5f5'
        });
      }
    } catch (error) {
      console.error('Failed to fetch theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const url = theme.id 
        ? apiUrl(`/api/themes/${theme.id}`)
        : apiUrl('/api/themes');
      
      console.log('🔍 SAVING THEME:', {
        logoWidth: theme.logoWidth,
        logoHeight: theme.logoHeight,
        fullTheme: theme
      });
      
      const response = await fetch(url, {
        method: theme.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(theme)
      });

      if (response.ok) {
        const savedTheme = await response.json();
        console.log('✅ SAVED SUCCESSFULLY:', savedTheme);
        alert('Theme saved successfully!');
        fetchActiveTheme();
      } else {
        const errorText = await response.text();
        console.error('❌ SAVE FAILED:', errorText);
        alert('Failed to save theme');
      }
    } catch (error) {
      console.error('Failed to save theme:', error);
      alert('Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading theme...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Theme Customizer</h1>
          <p className="text-gray-600 mt-1">Customize your site's appearance</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchActiveTheme}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={20} />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Settings */}
        <div className="space-y-6">
          {/* Branding */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Branding</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Title</label>
                <input
                  type="text"
                  value={theme.siteTitle}
                  onChange={(e) => setTheme({ ...theme, siteTitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                <input
                  type="text"
                  value={theme.siteTagline}
                  onChange={(e) => setTheme({ ...theme, siteTagline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                <input
                  type="text"
                  value={theme.logoUrl}
                  onChange={(e) => setTheme({ ...theme, logoUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
                {theme.logoUrl && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-semibold text-blue-900">Logo Display Size (CSS)</span>
                      <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Frontend</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs text-gray-700 font-medium mb-1">Width (px)</label>
                        <input
                          type="number"
                          value={theme.logoWidth || 40}
                          onChange={(e) => setTheme({ ...theme, logoWidth: parseInt(e.target.value) || 40 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-700 font-medium mb-1">Height (px)</label>
                        <input
                          type="number"
                          value={theme.logoHeight || 40}
                          onChange={(e) => setTheme({ ...theme, logoHeight: parseInt(e.target.value) || 40 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Quick Sizes:</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: 'Small (30px)', w: 30, h: 30 },
                          { label: 'Medium (40px)', w: 40, h: 40 },
                          { label: 'Large (60px)', w: 60, h: 60 },
                          { label: 'XL (80px)', w: 80, h: 80 },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setTheme({ ...theme, logoWidth: preset.w, logoHeight: preset.h })}
                            className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="p-3 bg-white border border-gray-300 rounded">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Preview ({theme.logoWidth || 40}px × {theme.logoHeight || 40}px):</p>
                      <img
                        src={theme.logoUrl}
                        alt="Logo preview"
                        style={{
                          width: `${theme.logoWidth || 40}px`,
                          height: `${theme.logoHeight || 40}px`,
                          objectFit: 'contain'
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      💡 Original image stays same size. Display controlled by CSS.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Colors</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'primaryColor', label: 'Primary' },
                { key: 'secondaryColor', label: 'Secondary' },
                { key: 'accentColor', label: 'Accent' },
                { key: 'backgroundColor', label: 'Background' },
                { key: 'textColor', label: 'Text' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme[key as keyof Theme] as string}
                      onChange={(e) => setTheme({ ...theme, [key]: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme[key as keyof Theme] as string}
                      onChange={(e) => setTheme({ ...theme, [key]: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Typography</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Heading Font</label>
                  <select
                    value={theme.headingFont}
                    onChange={(e) => setTheme({ ...theme, headingFont: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Playfair Display">Playfair Display</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Body Font</label>
                  <select
                    value={theme.bodyFont}
                    onChange={(e) => setTheme({ ...theme, bodyFont: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                    <option value="Montserrat">Montserrat</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Font Size: {theme.fontSizeBase}px
                </label>
                <input
                  type="range"
                  min="14"
                  max="20"
                  value={theme.fontSizeBase}
                  onChange={(e) => setTheme({ ...theme, fontSizeBase: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heading Font Size (H1): {theme.headingFontSize}px
                </label>
                <input
                  type="range"
                  min="24"
                  max="64"
                  step="2"
                  value={theme.headingFontSize}
                  onChange={(e) => setTheme({ ...theme, headingFontSize: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Body Font Size: {theme.bodyFontSize}px
                </label>
                <input
                  type="range"
                  min="14"
                  max="20"
                  value={theme.bodyFontSize}
                  onChange={(e) => setTheme({ ...theme, bodyFontSize: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Layout */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Layout</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Width: {theme.maxWidth}px
                </label>
                <input
                  type="range"
                  min="1024"
                  max="1920"
                  step="64"
                  value={theme.maxWidth}
                  onChange={(e) => setTheme({ ...theme, maxWidth: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Header Style</label>
                  <select
                    value={theme.headerStyle}
                    onChange={(e) => setTheme({ ...theme, headerStyle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="default">Default</option>
                    <option value="centered">Centered</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Card Style</label>
                  <select
                    value={theme.cardStyle}
                    onChange={(e) => setTheme({ ...theme, cardStyle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="elevated">Elevated</option>
                    <option value="flat">Flat</option>
                    <option value="bordered">Bordered</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Custom CSS */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Custom CSS</h2>
            <textarea
              rows={10}
              value={theme.customCss}
              onChange={(e) => setTheme({ ...theme, customCss: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder=".my-custom-class { color: red; }"
            />
            <p className="text-sm text-gray-500 mt-2">
              Add custom CSS to override default styles
            </p>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="lg:sticky lg:top-8 h-fit">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Preview</h2>
            <div 
              className="border border-gray-300 rounded-lg p-8 space-y-4"
              style={{
                backgroundColor: theme.backgroundColor,
                color: theme.textColor,
                fontFamily: theme.bodyFont,
                fontSize: `${theme.fontSizeBase}px`
              }}
            >
              {/* Logo & Title */}
              <div className="text-center pb-4 border-b" style={{ borderColor: theme.primaryColor }}>
                {theme.logoUrl && (
                  <img src={theme.logoUrl} alt="Logo" className="h-12 mx-auto mb-2" />
                )}
                <h1 
                  className="text-3xl font-bold"
                  style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}
                >
                  {theme.siteTitle}
                </h1>
                <p className="text-sm mt-1" style={{ color: theme.textColor }}>
                  {theme.siteTagline}
                </p>
              </div>

              {/* Sample Content */}
              <div className="space-y-3">
                <h2 
                  className="text-2xl font-bold"
                  style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}
                >
                  Sample Heading
                </h2>
                <p style={{ color: theme.textColor }}>
                  This is how your body text will look. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
                <button
                  className="px-6 py-2 rounded-lg font-medium"
                  style={{ 
                    backgroundColor: theme.accentColor,
                    color: theme.secondaryColor
                  }}
                >
                  Accent Button
                </button>
              </div>

              {/* Sample Card */}
              <div 
                className={`p-4 rounded-lg ${
                  theme.cardStyle === 'elevated' ? 'shadow-lg' :
                  theme.cardStyle === 'bordered' ? 'border-2' : ''
                }`}
                style={{ 
                  backgroundColor: theme.secondaryColor,
                  borderColor: theme.cardStyle === 'bordered' ? theme.primaryColor : undefined
                }}
              >
                <h3 
                  className="font-bold mb-2"
                  style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}
                >
                  Card Title
                </h3>
                <p className="text-sm" style={{ color: theme.textColor }}>
                  This is how cards will appear with the {theme.cardStyle} style.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}