import {
    ImageLibrary,
    ImageLibraryFilters,
    ImageLibraryListItem,
    ImageLibraryStats,
    ImageTag,
    ImageTagCreate,
} from '../types/library';
import api from './api';

// Helper function to get fresh CSRF token
const getFreshCsrfToken = async () => {
  const response = await api.get('/auth/csrf/');
  const token = response.data.csrfToken;
  api.defaults.headers.common['X-CSRFTOKEN'] = token;
  document.cookie = `csrftoken=${token}; path=/`;
  return token;
};

export const ImageTagsAPI = {
  list: () => api.get<ImageTag[]>('/library/tags/'),
  
  get: (id: number) => api.get<ImageTag>(`/library/tags/${id}/`),
  
  create: async (data: ImageTagCreate) => {
    await getFreshCsrfToken();
    return api.post<ImageTag>('/library/tags/', data);
  },
  
  delete: async (id: number) => {
    await getFreshCsrfToken();
    return api.delete(`/library/tags/${id}/`);
  },
};

export const ImageLibraryAPI = {
  list: (filters?: ImageLibraryFilters) => {
    const params = new URLSearchParams();
    
    if (filters?.search) {
      params.append('search', filters.search);
    }
    
    if (filters?.tags && filters.tags.length > 0) {
      params.append('tags', filters.tags.join(','));
    }
    
    if (filters?.language !== undefined) {
      params.append('language', filters.language);
    }
    
    const query = params.toString();
    return api.get<ImageLibraryListItem[]>(`/library/images/${query ? `?${query}` : ''}`);
  },
  
  get: (id: number) => api.get<ImageLibrary>(`/library/images/${id}/`),
  
  create: async (data: { name: string; description?: string; image: File; tag_ids?: number[]; language?: 'en' | 'fr' | null }) => {
    await getFreshCsrfToken();
    
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.description) {
      formData.append('description', data.description);
    }
    formData.append('image', data.image);
    if (data.tag_ids && data.tag_ids.length > 0) {
      data.tag_ids.forEach(tagId => {
        formData.append('tag_ids', tagId.toString());
      });
    }
    if (data.language) {
      formData.append('language', data.language);
    }
    
    return api.post<ImageLibrary>('/library/images/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  update: async (id: number, data: { name?: string; description?: string; tag_ids?: number[]; language?: 'en' | 'fr' | null }) => {
    await getFreshCsrfToken();
    return api.patch<ImageLibrary>(`/library/images/${id}/`, data);
  },
  
  delete: async (id: number) => {
    await getFreshCsrfToken();
    return api.delete(`/library/images/${id}/`);
  },
  
  stats: () => api.get<ImageLibraryStats>('/library/images/stats/'),
};
