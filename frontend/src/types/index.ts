


// Production models
export interface Sheet {
  id: number;
  name: string;
  business_id: string;
  language: string;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  created_by_username?: string;
  pages?: SheetPage[];
  pages_count?: number;
}

export interface SheetPage {
  id: number;
  sheet: number;
  sheet_name?: string;
  number: number;
  description: Record<string, string>; // e.g., { "en": "English desc", "fr": "Description française" }
  created_at: string;
  updated_at: string;
  created_by: number | null;
  created_by_username?: string;
  elements?: InteractiveElement[];
  elements_count?: number;
}

export interface InteractiveElement {
  id: number;
  page: number;
  page_number?: number;
  sheet_name?: string;
  business_id: string;
  type: string;
  description: object;
  language: string;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  created_by_username?: string;
}

export interface SheetCreateUpdate {
  name: string;
  business_id: string;
  language: string;
}

export interface SheetPageCreateUpdate {
  sheet: number;
  number: number;
  description?: Record<string, string>; // e.g., { "en": "English desc", "fr": "Description française" }
}

export interface InteractiveElementCreateUpdate {
  page: number;
  business_id: string;
  type: string;
  description: object;
  language: string;
}
