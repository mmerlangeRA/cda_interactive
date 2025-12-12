import {
  MediaLibrary,
  MediaLibraryFilters,
  MediaLibraryListItem,
  MediaLibraryStats,
  MediaTag,
  MediaTagCreate,
  MediaType,
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

export const MediaTagsAPI = {
  list: () => api.get<MediaTag[]>('/library/tags/'),
  
  get: (id: number) => api.get<MediaTag>(`/library/tags/${id}/`),
  
  create: async (data: MediaTagCreate) => {
    await getFreshCsrfToken();
    return api.post<MediaTag>('/library/tags/', data);
  },
  
  delete: async (id: number) => {
    await getFreshCsrfToken();
    return api.delete(`/library/tags/${id}/`);
  },
};

// Backward compatibility alias
export const ImageTagsAPI = MediaTagsAPI;

export const MediaLibraryAPI = {
  list: (filters?: MediaLibraryFilters) => {
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
    
    // NEW: Filter by media type
    if (filters?.media_type) {
      params.append('media_type', filters.media_type);
    }
    
    const query = params.toString();
    return api.get<MediaLibraryListItem[]>(`/library/images/${query ? `?${query}` : ''}`);
  },
  
  get: (id: number) => api.get<MediaLibrary>(`/library/images/${id}/`),
  
  create: async (data: { 
    name: string; 
    description?: string; 
    file: File; 
    media_type: MediaType;
    tag_ids?: number[]; 
    language?: 'en' | 'fr' | null 
  }) => {
    await getFreshCsrfToken();
    
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.description) {
      formData.append('description', data.description);
    }
    formData.append('file', data.file);
    formData.append('media_type', data.media_type);
    if (data.tag_ids && data.tag_ids.length > 0) {
      data.tag_ids.forEach(tagId => {
        formData.append('tag_ids', tagId.toString());
      });
    }
    if (data.language) {
      formData.append('language', data.language);
    }
    
    return api.post<MediaLibrary>('/library/images/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  update: async (id: number, data: { name?: string; description?: string; tag_ids?: number[]; language?: 'en' | 'fr' | null }) => {
    await getFreshCsrfToken();
    return api.patch<MediaLibrary>(`/library/images/${id}/`, data);
  },
  
  delete: async (id: number) => {
    await getFreshCsrfToken();
    return api.delete(`/library/images/${id}/`);
  },
  
  stats: () => api.get<MediaLibraryStats>('/library/images/stats/'),
};


