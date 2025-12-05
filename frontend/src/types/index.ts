


// Production models
export interface Sheet {
  id: number;
  name: string;
  business_id: string;
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
  z_order: number;
  descriptions: Record<string, string>; // {"en": "desc", "fr": "desc"}
  konva_jsons: Record<string, object>; // {"en": {...}, "fr": {...}}
  reference_value?: number | null;
  field_values?: FieldDefinitionValue[];
  created_at: string;
  updated_at: string;
  created_by: number | null;
  created_by_username?: string;
}

export interface SheetCreateUpdate {
  name: string;
  business_id: string;
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
  z_order?: number;
  descriptions: Record<string, string>;
  konva_jsons: Record<string, object>;
  reference_value?: number | null;
  field_values_data?: FieldDefinitionValueData[];
}

export interface FieldDefinitionValue {
  id: number;
  name: string;
  type: 'string' | 'int' | 'float' | 'image';
  language?: string | null;
  value: string | number | null;
  value_string?: string | null;
  value_int?: number | null;
  value_float?: number | null;
  value_image?: number | null;
  image?: Record<string, unknown>; // ImageLibrary object when expanded
}

export interface FieldDefinitionValueData {
  name: string;
  type: 'string' | 'int' | 'float' | 'image';
  language?: string | null;
  value_string?: string | null;
  value_int?: number | null;
  value_float?: number | null;
  value_image?: number | null;
}

// Filter entities for sheet filtering
export interface Boat {
  id: number;
  internal_id: string;
  name: string;
}

export interface GammeCabine {
  id: number;
  internal_id: string;
  boat: number;
  boat_name?: string;
}

export interface VarianteGamme {
  id: number;
  internal_id: string;
  gamme: number;
  gamme_internal_id?: string;
}

export interface Cabine {
  id: number;
  internal_id: string;
  variante_gamme: number;
  variante_internal_id?: string;
}

export interface Ligne {
  id: number;
  internal_id: string;
  name: string;
}

export interface Poste {
  id: number;
  internal_id: string;
  ligne: number;
  ligne_name?: string;
}

export interface SheetFilters {
  boat?: number;
  gamme_cabine?: number;
  variante_gamme?: number;
  cabine?: number;
  ligne?: number;
  poste?: number;
  ligne_sens?: 'D' | 'G' | '-';
}
