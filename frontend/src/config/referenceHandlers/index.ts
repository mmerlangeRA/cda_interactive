export * from './arrow';
export * from './base';
export * from './circle';
export * from './freeImage';
export * from './freeText';
export * from './freeVideo';
export * from './gabarit';
export * from './rectangle';
export * from './screw';

import { arrowHandler } from './arrow';
import { ReferenceElementHandler } from './base';
import { circleHandler } from './circle';
import { freeImageHandler } from './freeImage';
import { freeTextHandler } from './freeText';
import { freeVideoHandler } from './freeVideo';
import { gabaritHandler } from './gabarit';
import { rectangleHandler } from './rectangle';
import { screwHandler } from './screw';

/**
 * Registry of all available handlers
 */
const handlerRegistry: Map<string, ReferenceElementHandler> = new Map<string, ReferenceElementHandler>([
  ['screw', screwHandler as ReferenceElementHandler],
  ['gabarit', gabaritHandler as ReferenceElementHandler],
  ['freeImage', freeImageHandler as ReferenceElementHandler],
  ['freeText', freeTextHandler as ReferenceElementHandler],
  ['freeVideo', freeVideoHandler as ReferenceElementHandler],
  ['circle', circleHandler as ReferenceElementHandler],
  ['rectangle', rectangleHandler as ReferenceElementHandler],
  ['arrow', arrowHandler as ReferenceElementHandler],
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
