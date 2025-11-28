import { ImageLibrary } from './library';

export type FieldType = 'string' | 'int' | 'float' | 'image';
export type Language = 'en' | 'fr';

/**
 * Field value stored in backend
 */
export interface FieldDefinitionValue {
  id: number;
  name: string;
  type: FieldType;
  language: Language | null;
  value: string | number | ImageLibrary | null;
  value_string?: string | null;
  value_int?: number | null;
  value_float?: number | null;
  value_image?: number | null;
  image?: ImageLibrary;
}

/**
 * Reference instance stored in backend
 */
export interface ReferenceValue {
  id: number;
  type: string;
  icon?: string | null;
  version: number;
  created_at: string;
  updated_at: string;
  created_by?: number;
  created_by_username?: string;
  fields: FieldDefinitionValue[];
}

/**
 * Simplified reference for list views
 */
export interface ReferenceValueList {
  id: number;
  type: string;
  icon?: string | null;
  version: number;
  created_at: string;
  updated_at: string;
  created_by_username?: string;
  fields_preview?: {
    name: string;
    value: string | number | null;
    language: Language | null;
  } | null;
}

/**
 * History entry for reference changes
 */
export interface ReferenceHistory {
  id: number;
  reference: number;
  version: number;
  changed_by?: number;
  changed_by_username?: string;
  changed_at: string;
  changes: Record<string, unknown>;
}

/**
 * Form data for creating/updating references
 */
export interface ReferenceFormData {
  type: string;
  icon?: string;
  fields_data: Array<{
    name: string;
    type: FieldType;
    language: Language | null;
    value_string?: string;
    value_int?: number;
    value_float?: number;
    value_image?: number;
  }>;
}
