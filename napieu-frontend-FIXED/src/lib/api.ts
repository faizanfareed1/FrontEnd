import axios from 'axios';
import type {
  Article,
  Category,
  Theme,
  LayoutSection,
  MediaFile,
  AuthResponse,
  LoginRequest,
  ArticleFormData,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('authToken');
  },
};

// Articles API
export const articlesApi = {
  getAll: async (): Promise<Article[]> => {
    const response = await api.get<Article[]>('/articles');
    return response.data;
  },
  getPublished: async (): Promise<Article[]> => {
    const response = await api.get<Article[]>('/articles/published');
    return response.data;
  },
  getBySlug: async (slug: string): Promise<Article> => {
    const response = await api.get<Article>(`/articles/slug/${slug}`);
    return response.data;
  },
  getById: async (id: number): Promise<Article> => {
    const response = await api.get<Article>(`/articles/${id}`);
    return response.data;
  },
  create: async (article: ArticleFormData): Promise<Article> => {
    const response = await api.post<Article>('/articles', article);
    return response.data;
  },
  update: async (id: number, article: Partial<ArticleFormData>): Promise<Article> => {
    const response = await api.put<Article>(`/articles/${id}`, article);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/articles/${id}`);
  },
  incrementViews: async (id: number): Promise<void> => {
    await api.post(`/articles/${id}/views`);
  },
};

// Categories API
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },
  getById: async (id: number): Promise<Category> => {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  },
  create: async (category: Omit<Category, 'id'>): Promise<Category> => {
    const response = await api.post<Category>('/categories', category);
    return response.data;
  },
  update: async (id: number, category: Partial<Category>): Promise<Category> => {
    const response = await api.put<Category>(`/categories/${id}`, category);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

// Themes API
export const themesApi = {
  getActive: async (): Promise<Theme> => {
    const response = await api.get<Theme>('/themes/active');
    return response.data;
  },
  getAll: async (): Promise<Theme[]> => {
    const response = await api.get<Theme[]>('/themes');
    return response.data;
  },
  getById: async (id: number): Promise<Theme> => {
    const response = await api.get<Theme>(`/themes/${id}`);
    return response.data;
  },
  create: async (theme: Partial<Theme>): Promise<Theme> => {
    const response = await api.post<Theme>('/themes', theme);
    return response.data;
  },
  update: async (id: number, theme: Partial<Theme>): Promise<Theme> => {
    const response = await api.put<Theme>(`/themes/${id}`, theme);
    return response.data;
  },
  activate: async (id: number): Promise<Theme> => {
    const response = await api.put<Theme>(`/themes/${id}/activate`);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/themes/${id}`);
  },
};

// Layout API
export const layoutApi = {
  getPublic: async (): Promise<LayoutSection[]> => {
    const response = await api.get<LayoutSection[]>('/layout/public');
    return response.data;
  },
  getAll: async (): Promise<LayoutSection[]> => {
    const response = await api.get<LayoutSection[]>('/layout');
    return response.data;
  },
  getById: async (id: number): Promise<LayoutSection> => {
    const response = await api.get<LayoutSection>(`/layout/${id}`);
    return response.data;
  },
  create: async (section: Partial<LayoutSection>): Promise<LayoutSection> => {
    const response = await api.post<LayoutSection>('/layout', section);
    return response.data;
  },
  update: async (id: number, section: Partial<LayoutSection>): Promise<LayoutSection> => {
    const response = await api.put<LayoutSection>(`/layout/${id}`, section);
    return response.data;
  },
  reorder: async (sectionIds: number[]): Promise<LayoutSection[]> => {
    const response = await api.put<LayoutSection[]>('/layout/reorder', sectionIds);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/layout/${id}`);
  },
};

// Media API
export const mediaApi = {
  getAll: async (): Promise<MediaFile[]> => {
    const response = await api.get<MediaFile[]>('/media');
    return response.data;
  },
  upload: async (file: File): Promise<MediaFile> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<MediaFile>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  update: async (id: number, data: Partial<MediaFile>): Promise<MediaFile> => {
    const response = await api.put<MediaFile>(`/media/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/media/${id}`);
  },
};

export default api;
