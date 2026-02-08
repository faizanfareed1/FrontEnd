// API Types
export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string | null;
  author: string;
  readTime: number;
  views: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  source: string | null;
  categories: Category[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  icon: string | null;
  displayOrder: number;
}

export interface Theme {
  id: number;
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
  maxWidth: number;
  headerStyle: string;
  cardStyle: string;
  logoUrl: string | null;
  logoWidth?: number;
  logoHeight?: number;
  siteTitle: string;
  siteTagline: string;
  customCss: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LayoutSection {
  id: number;
  name: string;
  type: 'hero' | 'featured' | 'grid' | 'list' | 'banner';
  gridColumns: number;
  displayOrder: number;
  visible: boolean;
  categoryFilter: string | null;
  articleLimit: number;
  sortBy: string;
  sortDirection: 'ASC' | 'DESC';
  backgroundColor: string | null;
  paddingTop: number;
  paddingBottom: number;
  showExcerpt: boolean;
  showAuthor: boolean;
  showDate: boolean;
  showCategory: boolean;
  sectionTitle: string | null;
  showSectionTitle: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MediaFile {
  id: number;
  filename: string;
  originalFilename: string;
  url: string;
  fileType: string;
  fileSize: number;
  width: number;
  height: number;
  alt: string | null;
  caption: string | null;
  createdAt: string;
}

export interface User {
  id: number;
  username: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  username: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

// Form Types
export interface ArticleFormData {
  title: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  author: string;
  readTime?: number;
  published: boolean;
  source?: string;
  categories: number[];
}

export interface ThemeFormData extends Omit<Theme, 'id' | 'createdAt' | 'updatedAt'> {}

export interface LayoutSectionFormData extends Omit<LayoutSection, 'id' | 'createdAt' | 'updatedAt'> {}

export interface HomepageSettings {
  id: number;
  showBreakingNews: boolean;
  breakingNewsArticleId: number | null;
  breakingNewsCustomText: string | null;
  breakingNewsArticle: Article | null;
  featuredArticleId: number | null;
  featuredArticle: Article | null;
  editorsPicksIds: number[];
  editorsPicksArticles: Article[];
  showQuote: boolean;
  quoteText: string;
  quoteAuthor: string;
  showNewsletter: boolean;
  newsletterTitle: string;
  newsletterDescription: string;
  showSocialFeed: boolean;
  twitterWidgetUrl: string | null;
}

export interface HomepageSettingsFormData {
  showBreakingNews: boolean;
  breakingNewsArticleId: number | null;
  breakingNewsCustomText: string;
  featuredArticleId: number | null;
  editorsPicksIds: number[];
  showQuote: boolean;
  quoteText: string;
  quoteAuthor: string;
  showNewsletter: boolean;
  newsletterTitle: string;
  newsletterDescription: string;
  showSocialFeed: boolean;
  twitterWidgetUrl: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}