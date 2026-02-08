import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CategoryClient from './CategoryClient';
import { apiUrl } from '@/config/api';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  readTime: number;
  featuredImage: string;
  categories: Array<{ name: string; color: string }>;
}

// This function generates all possible category slugs at build time
export async function generateStaticParams() {
  try {
    const response = await fetch(apiUrl('/api/categories'));
    if (!response.ok) {
      console.error('Failed to fetch categories for static generation');
      return [];
    }
    
    const categories: Category[] = await response.json();
    
    return categories.map((category) => ({
      slug: category.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for each category
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const response = await fetch(apiUrl(`/api/categories/${slug}`));
    if (!response.ok) {
      return {
        title: 'Category Not Found | NAPI EU',
      };
    }
    
    const category: Category = await response.json();
    
    return {
      title: `${category.name} | NAPI EU`,
      description: category.description || `Browse all articles in ${category.name}`,
    };
  } catch (error) {
    return {
      title: 'NAPI EU',
    };
  }
}

// Server component that fetches data
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  let category: Category | null = null;
  let articles: Article[] = [];
  let error = '';

  try {
    // Fetch category details
    const categoryResponse = await fetch(apiUrl(`/api/categories/${slug}`), {
      next: { revalidate: 3600 }
    });
    
    if (!categoryResponse.ok) {
      if (categoryResponse.status === 404) {
        notFound();
      }
      error = 'Failed to load category';
    } else {
      category = await categoryResponse.json();
    }

    // Fetch articles for this category
    if (category) {
      const articlesResponse = await fetch(apiUrl(`/api/articles/category/${slug}`), {
        next: { revalidate: 3600 }
      });
      
      if (articlesResponse.ok) {
        const data = await articlesResponse.json();
        articles = data.content || data || [];
      }
    }
  } catch (err) {
    console.error('Failed to fetch category data:', err);
    error = 'Failed to load category';
  }

  return <CategoryClient category={category} articles={articles} error={error} />;
}