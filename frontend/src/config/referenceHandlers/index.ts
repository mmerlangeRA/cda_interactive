export * from './base';
export * from './freeImage';
export * from './freeText';
export * from './gabarit';
export * from './screw';

import { ReferenceElementHandler } from './base';
import { freeImageHandler } from './freeImage';
import { freeTextHandler } from './freeText';
import { gabaritHandler } from './gabarit';
import { screwHandler } from './screw';

/**
 * Registry of all available handlers
 */
const handlerRegistry: Map<string, ReferenceElementHandler> = new Map<string, ReferenceElementHandler>([
  ['screw', screwHandler as ReferenceElementHandler],
  ['gabarit', gabaritHandler as ReferenceElementHandler],
  ['freeImage', freeImageHandler as ReferenceElementHandler],
  ['freeText', freeTextHandler as ReferenceElementHandler],
]);

/**
 * Get handler for a specific reference type
 */
export function getHandler(type: string): ReferenceElementHandler | undefined {
  return handlerRegistry.get(type);
}

/**
 * Get all available handlers
 */
export function getAllHandlers(): ReferenceElementHandler[] {
  return Array.from(handlerRegistry.values());
}
