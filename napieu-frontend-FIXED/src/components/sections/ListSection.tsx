'use client';

import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Clock, Eye } from 'lucide-react';
import type { LayoutSection, Article } from '@/types';

interface ListSectionProps {
  section: LayoutSection;
  articles: Article[];
}

export default function ListSection({ section, articles }: ListSectionProps) {
  if (articles.length === 0) return null;

  const sectionStyle = {
    backgroundColor: section.backgroundColor || undefined,
    paddingTop: `${section.paddingTop}rem`,
    paddingBottom: `${section.paddingBottom}rem`,
  };

  return (
    <section style={sectionStyle} className="dark:bg-gray-900">
      <div className="max-w-container mx-auto px-4">
        {section.showSectionTitle && section.sectionTitle && (
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">{section.sectionTitle}</h2>
        )}

        <div className="space-y-6">
          {articles.map(article => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="block group"
            >
              <article className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700 p-4">
                {article.featuredImage && (
                  <div className="relative w-full md:w-48 h-32 flex-shrink-0 overflow-hidden rounded">
                    <Image
                      src={article.featuredImage}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}

                <div className="flex-grow">
                  {section.showCategory && article.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {article.categories.slice(0, 2).map(category => (
                        <span
                          key={category.id}
                          className="px-2 py-1 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: category.color }}
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <h3 className="text-xl font-bold mb-2 line-clamp-2 text-gray-900 dark:text-white group-hover:text-accent dark:group-hover:text-blue-400 transition-colors">
                    {article.title}
                  </h3>

                  {section.showExcerpt && article.excerpt && (
                    <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    {section.showAuthor && (
                      <span className="font-medium">{article.author}</span>
                    )}
                    {section.showDate && article.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {format(new Date(article.publishedAt), 'MMM d, yyyy')}
                      </span>
                    )}
                    {article.readTime && (
                      <span>{article.readTime} min read</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {article.views.toLocaleString()} views
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}