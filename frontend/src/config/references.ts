import { ArrowRight, CameraVideo, Circle, Icon, Image, Rulers, Screwdriver, Square, TypeBold } from 'react-bootstrap-icons';
import {
  arrowHandler,
  circleHandler,
  freeImageHandler,
  freeTextHandler,
  freeVideoHandler,
  gabaritHandler,
  rectangleHandler,
  ReferenceElementHandler,
  screwHandler
} from './referenceHandlers';

export type FieldType = 'string' | 'int' | 'float' | 'image';

export interface FieldDefinitionModel {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  needs_translation: boolean;
}

export interface ReferenceModel {
  type: string;
  label: string;
  icon: Icon;
  fields: FieldDefinitionModel[];
  handler: ReferenceElementHandler;
}

/**
 * Hardcoded reference type definitions
 * Schema is defined here, only values are stored in backend
 */
export const REFERENCE_TYPES: ReferenceModel[] = [
  {
    type: 'screw',
    label: 'Screw',
    icon: Screwdriver,
    handler: screwHandler,
    fields: [
      {
        name: 'reference',
        label: 'Reference',
        type: 'string',
        required: true,
        needs_translation: false
      },
      {
        name: 'image',
        label: 'Image',
        type: 'image',
        required: false,
        needs_translation: false, // Same image for all languages
      },
    ],
  },
  {
    type: 'gabarit',
    label: 'Gabarit',
    icon: Rulers,
    handler: gabaritHandler,
    fields: [
      {
        name: 'reference',
        label: 'Reference',
        type: 'string',
        required: true,
        needs_translation: false,
      },
    ],
  },
  {
    type: 'freeImage',
    label: 'Free Image',
    icon: Image,
    handler: freeImageHandler,
    fields: [
      {
        name: 'image',
        label: 'Image',
        type: 'image',
        required: true,
        needs_translation: false,
      },
      {
        name: 'description',
        label: 'Description',
        type: 'string',
        required: false,
        needs_translation: true,
      },
    ],
  },
  {
    type: 'freeText',
    label: 'Free Text',
    icon: TypeBold,
    handler: freeTextHandler,
    fields: [
      {
        name: 'text',
        label: 'Text',
        type: 'string',
        required: true,
        needs_translation: true,
      },
      {
        name: 'fontSize',
        label: 'Font Size',
        type: 'int',
        required: false,
        needs_translation: false,
      },
      {
        name: 'fill',
        label: 'Text Color',
        type: 'string',
        required: false,
        needs_translation: false,
      },
    ],
  },
  {
    type: 'freeVideo',
    label: 'Free Video',
    icon: CameraVideo,
    handler: freeVideoHandler,
    fields: [
      {
        name: 'video',
        label: 'Video',
        type: 'image', // Using 'image' type for file selection (it works for videos too)
        required: true,
        needs_translation: false,
      },
      {
        name: 'description',
        label: 'Description',
        type: 'string',
        required: false,
        needs_translation: true,
      },
    ],
  },
  {
    type: 'circle',
    label: 'Circle',
    icon: Circle,
    handler: circleHandler,
    fields: [],
  },
  {
    type: 'rectangle',
    label: 'Rectangle',
    icon: Square,
    handler: rectangleHandler,
    fields: [],
  },
  {
    type: 'arrow',
    label: 'Arrow',
    icon: ArrowRight,
    handler: arrowHandler,
    fields: [],
  },
];

/**
 * Get reference model by type
 */
export const getReferenceModel = (type: string): ReferenceModel | undefined => {
  return REFERENCE_TYPES.find(ref => ref.type === type);
};

/**
 * Get field definition by name
 */
export const getFieldDefinition = (
  type: string,
  fieldName: string
): FieldDefinitionModel | undefined => {
  const model = getReferenceModel(type);
  return model?.fields.find(field => field.name === fieldName);
};

/**
 * Get available languages
 */
export const AVAILABLE_LANGUAGES = ['en', 'fr'] as const;
export type Language = (typeof AVAILABLE_LANGUAGES)[number];
