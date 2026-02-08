'use client';

import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Clock, Eye } from 'lucide-react';
import type { LayoutSection, Article } from '@/types';

interface HeroSectionProps {
  section: LayoutSection;
  articles: Article[];
}

export default function HeroSection({ section, articles }: HeroSectionProps) {
  if (articles.length === 0) return null;

  const article = articles[0];

  const sectionStyle = {
    backgroundColor: section.backgroundColor || undefined,
    paddingTop: `${section.paddingTop}rem`,
    paddingBottom: `${section.paddingBottom}rem`,
  };

  return (
    <section style={sectionStyle}>
      <div className="max-w-container mx-auto px-4">
        {section.showSectionTitle && section.sectionTitle && (
          <h2 className="text-3xl font-bold mb-8">{section.sectionTitle}</h2>
        )}

        <Link href={`/articles/${article.slug}`} className="block">
          <div className="relative h-[500px] rounded-xl overflow-hidden group">
            {article.featuredImage && (
              <Image
                src={article.featuredImage}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              {section.showCategory && article.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.categories.map(category => (
                    <span
                      key={category.id}
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-4xl md:text-5xl font-bold mb-4 line-clamp-2">
                {article.title}
              </h1>

              {section.showExcerpt && article.excerpt && (
                <p className="text-lg text-gray-200 mb-4 line-clamp-2">
                  {article.excerpt}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                {section.showAuthor && (
                  <span className="font-medium">{article.author}</span>
                )}
                {section.showDate && article.publishedAt && (
                  <span className="flex items-center gap-1">
                    <Clock size={16} />
                    {format(new Date(article.publishedAt), 'MMM d, yyyy')}
                  </span>
                )}
                {article.readTime && (
                  <span>{article.readTime} min read</span>
                )}
                <span className="flex items-center gap-1">
                  <Eye size={16} />
                  {article.views.toLocaleString()} views
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
