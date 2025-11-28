// Image Library Types

export interface ImageTag {
  id: number;
  name: string;
  created_at: string;
  images_count: number;
}

export interface ImageLibrary {
  id: number;
  name: string;
  description: string;
  image: string;
  image_url: string;
  tags: ImageTag[];
  tag_ids?: number[];
  language: 'en' | 'fr' | null;
  width: number | null;
  height: number | null;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  created_by_username: string;
}

export interface ImageLibraryListItem {
  id: number;
  name: string;
  description: string;
  image_url: string;
  thumbnail_url: string;
  tags: ImageTag[];
  language: 'en' | 'fr' | null;
  width: number | null;
  height: number | null;
  created_at: string;
  created_by_username: string;
}

export interface ImageLibraryStats {
  total_images: number;
  images_with_tags: number;
  images_by_language: {
    en: number;
    fr: number;
    none: number;
  };
}

export interface ImageLibraryFilters {
  search?: string;
  tags?: number[];
  language?: 'en' | 'fr' | 'null' | '';
}

export interface ImageLibraryCreateUpdate {
  name: string;
  description?: string;
  image: File;
  tag_ids?: number[];
  language?: 'en' | 'fr' | null;
}

export interface ImageTagCreate {
  name: string;
}
