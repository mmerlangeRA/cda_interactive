import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ImageLibraryAPI, ImageTagsAPI } from '../services/library';
import { ImageLibraryFilters, ImageLibraryListItem, ImageTag } from '../types/library';

interface LibraryContextType {
  images: ImageLibraryListItem[];
  tags: ImageTag[];
  filters: ImageLibraryFilters;
  isLoading: boolean;
  loadImages: () => Promise<void>;
  loadTags: () => Promise<void>;
  setFilters: (filters: ImageLibraryFilters) => void;
  refreshImages: () => Promise<void>;
  refreshTags: () => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [images, setImages] = useState<ImageLibraryListItem[]>([]);
  const [tags, setTags] = useState<ImageTag[]>([]);
  const [filters, setFilters] = useState<ImageLibraryFilters>({});
  const [isLoading, setIsLoading] = useState(false);

  const loadImages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await ImageLibraryAPI.list(filters);
      setImages(response.data);
    } catch (error) {
      console.error('Failed to load images:', error);
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const loadTags = useCallback(async () => {
    try {
      const response = await ImageTagsAPI.list();
      setTags(response.data);
    } catch (error) {
      console.error('Failed to load tags:', error);
      setTags([]);
    }
  }, []);

  const refreshImages = useCallback(async () => {
    await loadImages();
  }, [loadImages]);

  const refreshTags = useCallback(async () => {
    await loadTags();
  }, [loadTags]);

  // Load images when filters change
  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // Load tags on mount
  useEffect(() => {
    loadTags();
  }, [loadTags]);

  return (
    <LibraryContext.Provider
      value={{
        images,
        tags,
        filters,
        isLoading,
        loadImages,
        loadTags,
        setFilters,
        refreshImages,
        refreshTags,
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
