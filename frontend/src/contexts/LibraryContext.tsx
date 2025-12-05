import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { MediaLibraryAPI, MediaTagsAPI } from '../services/library';
import { MediaLibraryFilters, MediaLibraryListItem, MediaTag } from '../types/library';

interface LibraryContextType {
  media: MediaLibraryListItem[];
  images: MediaLibraryListItem[];  // Backward compatibility - filtered to images only
  videos: MediaLibraryListItem[];  // Filtered to videos only
  tags: MediaTag[];
  filters: MediaLibraryFilters;
  isLoading: boolean;
  loadMedia: () => Promise<void>;
  loadTags: () => Promise<void>;
  setFilters: (filters: MediaLibraryFilters) => void;
  refreshMedia: () => Promise<void>;
  refreshTags: () => Promise<void>;
  // Backward compatibility aliases
  loadImages: () => Promise<void>;
  refreshImages: () => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [media, setMedia] = useState<MediaLibraryListItem[]>([]);
  const [tags, setTags] = useState<MediaTag[]>([]);
  const [filters, setFilters] = useState<MediaLibraryFilters>({});
  const [isLoading, setIsLoading] = useState(false);

  const loadMedia = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await MediaLibraryAPI.list(filters);
      setMedia(response.data);
    } catch (error) {
      console.error('Failed to load media:', error);
      setMedia([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const loadTags = useCallback(async () => {
    try {
      const response = await MediaTagsAPI.list();
      setTags(response.data);
    } catch (error) {
      console.error('Failed to load tags:', error);
      setTags([]);
    }
  }, []);

  const refreshMedia = useCallback(async () => {
    await loadMedia();
  }, [loadMedia]);

  const refreshTags = useCallback(async () => {
    await loadTags();
  }, [loadTags]);

  // Backward compatibility aliases
  const loadImages = loadMedia;
  const refreshImages = refreshMedia;

  // Filtered lists
  const images = media.filter(item => item.media_type === 'image');
  const videos = media.filter(item => item.media_type === 'video');

  // Load media when filters change
  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  // Load tags on mount
  useEffect(() => {
    loadTags();
  }, [loadTags]);

  return (
    <LibraryContext.Provider
      value={{
        media,
        images,
        videos,
        tags,
        filters,
        isLoading,
        loadMedia,
        loadTags,
        setFilters,
        refreshMedia,
        refreshTags,
        loadImages,
        refreshImages,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
