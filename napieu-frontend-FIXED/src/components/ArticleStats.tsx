'use client';

import { Eye, Clock, MessageCircle, Share2 } from 'lucide-react';

interface ArticleStatsProps {
  views?: number;
  readTime?: number;
  commentCount?: number;
  shareCount?: number;
  showIcons?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ArticleStats({
  views = 0,
  readTime,
  commentCount,
  shareCount,
  showIcons = true,
  size = 'sm',
  className = '',
}: ArticleStatsProps) {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  const textSize = sizeClasses[size];
  const iconSize = iconSizes[size];

  return (
    <div className={`flex flex-wrap items-center gap-3 ${textSize} text-gray-500 ${className}`}>
      {/* Views */}
      <div className="flex items-center gap-1">
        {showIcons && <Eye size={iconSize} />}
        <span className="font-medium">{views.toLocaleString()}</span>
        {!showIcons && <span className="text-gray-400">views</span>}
      </div>

      {/* Read Time */}
      {readTime && (
        <>
          <span className="text-gray-300">•</span>
          <div className="flex items-center gap-1">
            {showIcons && <Clock size={iconSize} />}
            <span>{readTime} min</span>
          </div>
        </>
      )}

      {/* Comments */}
      {commentCount !== undefined && commentCount > 0 && (
        <>
          <span className="text-gray-300">•</span>
          <div className="flex items-center gap-1">
            {showIcons && <MessageCircle size={iconSize} />}
            <span>{commentCount}</span>
          </div>
        </>
      )}

      {/* Shares */}
      {shareCount !== undefined && shareCount > 0 && (
        <>
          <span className="text-gray-300">•</span>
          <div className="flex items-center gap-1">
            {showIcons && <Share2 size={iconSize} />}
            <span>{shareCount}</span>
          </div>
        </>
      )}
    </div>
  );
}