'use client';

import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Clock, Eye } from 'lucide-react';
import type { LayoutSection, Article } from '@/types';

interface GridSectionProps {
  section: LayoutSection;
  articles: Article[];
}

export default function GridSection({ section, articles }: GridSectionProps) {
  if (articles.length === 0) return null;

  const sectionStyle = {
    backgroundColor: section.backgroundColor || undefined,
    paddingTop: `${section.paddingTop}rem`,
    paddingBottom: `${section.paddingBottom}rem`,
  };

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[section.gridColumns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <section style={sectionStyle} className="dark:bg-gray-900">
      <div className="max-w-container mx-auto px-4">
        {section.showSectionTitle && section.sectionTitle && (
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">{section.sectionTitle}</h2>
        )}

        <div className={`grid ${gridCols} gap-6`}>
          {articles.map(article => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="block group"
            >
              <article className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
                {article.featuredImage && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={article.featuredImage}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}

                <div className="p-5 flex-grow flex flex-col">
                  {section.showCategory && article.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
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
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-grow">
                      {article.excerpt}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-auto">
                    {section.showAuthor && (
                      <span className="font-medium">{article.author}</span>
                    )}
                    {section.showDate && article.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {format(new Date(article.publishedAt), 'MMM d')}
                      </span>
                    )}
                    {article.readTime && (
                      <span>{article.readTime}min</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {article.views}
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