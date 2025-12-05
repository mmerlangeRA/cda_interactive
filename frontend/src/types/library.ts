// Media Library Types (Images & Videos)

export type MediaType = 'image' | 'video';

export interface MediaTag {
  id: number;
  name: string;
  created_at: string;
  media_count: number;
}

// Backward compatibility alias
export type ImageTag = MediaTag;

export interface MediaLibrary {
  id: number;
  name: string;
  description: string;
  media_type: MediaType;
  file: string;
  file_url: string;
  thumbnail: string | null;
  thumbnail_url: string | null;
  tags: MediaTag[];
  tag_ids?: number[];
  language: 'en' | 'fr' | null;
  width: number | null;
  height: number | null;
  file_size: number | null;
  duration: number | null;  // For videos (seconds)
  created_at: string;
  updated_at: string;
  created_by: number | null;
  created_by_username: string;
}

// Backward compatibility alias
export type ImageLibrary = MediaLibrary;

export interface MediaLibraryListItem {
  id: number;
  name: string;
  description: string;
  media_type: MediaType;
  file_url: string;
  thumbnail_url: string;
  tags: MediaTag[];
  language: 'en' | 'fr' | null;
  width: number | null;
  height: number | null;
  file_size: number | null;
  duration: number | null;  // For videos (seconds)
  created_at: string;
  created_by_username: string;
}

// Backward compatibility alias
export type ImageLibraryListItem = MediaLibraryListItem;

export interface MediaLibraryStats {
  total_media: number;
  media_with_tags: number;
  media_by_language: {
    en: number;
    fr: number;
    none: number;
  };
  media_by_type: {
    image: number;
    video: number;
  };
}

// Backward compatibility alias
export type ImageLibraryStats = MediaLibraryStats;

export interface MediaLibraryFilters {
  search?: string;
  tags?: number[];
  language?: 'en' | 'fr' | 'null' | '';
  media_type?: MediaType;  // NEW: Filter by media type
}

// Backward compatibility alias
export type ImageLibraryFilters = MediaLibraryFilters;

export interface MediaLibraryCreateUpdate {
  name: string;
  description?: string;
  file: File;  // Can be image or video file
  media_type: MediaType;  // NEW: Explicitly set media type
  tag_ids?: number[];
  language?: 'en' | 'fr' | null;
}

// Backward compatibility alias
export type ImageLibraryCreateUpdate = MediaLibraryCreateUpdate;

export interface MediaTagCreate {
  name: string;
}

// Backward compatibility alias
export type ImageTagCreate = MediaTagCreate;
