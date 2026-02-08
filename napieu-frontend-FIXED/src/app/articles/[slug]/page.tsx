import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArticleClient from './ArticleClient';
import { apiUrl } from '@/config/api';

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  readTime: number;
  views: number;
  featuredImage: string;
  source: string;
  categories: Array<{ id: number; name: string; slug: string; color: string }>;
}

// This function generates all possible article slugs at build time
export async function generateStaticParams() {
  try {
    const response = await fetch(apiUrl('/api/articles?size=1000'));
    if (!response.ok) {
      console.error('Failed to fetch articles for static generation');
      return [];
    }
    
    const data = await response.json();
    const articles = data.content || data || [];
    
    return articles.map((article: Article) => ({
      slug: article.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for each article
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const response = await fetch(apiUrl(`/api/articles/${slug}`));
    if (!response.ok) {
      return {
        title: 'Article Not Found | NAPI EU',
      };
    }
    
    const article: Article = await response.json();
    
    return {
      title: `${article.title} | NAPI EU`,
      description: article.excerpt,
      openGraph: {
        title: article.title,
        description: article.excerpt,
        images: article.featuredImage ? [article.featuredImage] : [],
      },
    };
  } catch (error) {
    return {
      title: 'NAPI EU',
    };
  }
}

// Server component that fetches data
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  let article: Article | null = null;
  let error = '';

  try {
    const response = await fetch(apiUrl(`/api/articles/${slug}`), {
      // Revalidate every hour in production
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      if (response.status === 404) {
        notFound();
      }
      error = 'Failed to load article';
    } else {
      article = await response.json();
    }
  } catch (err) {
    console.error('Failed to fetch article:', err);
    error = 'Failed to load article';
  }

  // Pass the article data to the client component
  return <ArticleClient article={article} error={error} slug={slug} />;
}