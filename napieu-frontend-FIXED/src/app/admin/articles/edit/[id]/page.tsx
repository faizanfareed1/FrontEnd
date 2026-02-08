import { notFound } from 'next/navigation';
import EditArticleClient from '../EditArticleClient';
import { apiUrl } from '@/config/api';

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  readTime: number;
  published: boolean;
  featuredImage: string;
  source: string;
  categories: Array<{ id: number; name: string; slug: string }>;
}

// Generate static params for all articles (for admin editing)
// NOTE: For admin pages, you might want to skip static generation
// since they require authentication. See alternative approach below.
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
      id: article.id.toString(),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Server component - just passes the ID to client
export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // For admin pages that require authentication,
  // we just pass the ID to the client component
  // The actual data fetching happens on the client with auth tokens
  
  return <EditArticleClient articleId={id} />;
}