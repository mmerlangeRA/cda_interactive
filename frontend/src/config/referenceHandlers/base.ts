import { ReferenceValue } from '../../types/reference';

export interface CanvasElement {
  id: string;
  type: string;
  referenceId?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  opacity?: number;
  [key: string]: unknown; // Allow additional properties
}

export interface SpawnPosition {
  x: number;
  y: number;
}

/**
 * Base abstract class for reference element handlers
 * Each reference type (screw, gabarit, etc.) must implement this
 */
export abstract class ReferenceElementHandler {
  abstract readonly type: string;
  
  /**
   * Spawn a new canvas element from a reference
   * Called when user clicks a reference in the library panel
   */
  abstract spawn(reference: ReferenceValue, position: SpawnPosition): CanvasElement;
  
  /**
   * Get default properties for this element type
   * Used when spawning new elements
   */
  abstract getDefaultProperties(): Partial<CanvasElement>;
  
  /**
   * Serialize element to backend format
   * Converts canvas element to InteractiveElement data
   */
  serialize(element: CanvasElement): Record<string, unknown> {
    return {
      business_id: element.id,
      type: this.type,
      reference_value: element.referenceId,
      konva_transform: {
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        rotation: element.rotation || 0,
        scaleX: element.scaleX || 1,
        scaleY: element.scaleY || 1,
      },
      description: this.serializeDescription(element),
      language: 'en', // Default language
    };
  }
  
  /**
   * Deserialize from backend format
   * Converts InteractiveElement data to canvas element
   */
  deserialize(data: Record<string, unknown>): CanvasElement {
    const transform = (data.konva_transform as Record<string, unknown>) || {};
    const description = (data.description as Record<string, unknown>) || {};
    
    return {
      id: (data.business_id as string) || `element-${data.id}`,
      type: this.type,
      referenceId: data.reference_value as number | undefined,
      x: (transform.x as number) || 0,
      y: (transform.y as number) || 0,
      width: (transform.width as number) || 100,
      height: (transform.height as number) || 100,
      rotation: (transform.rotation as number) || 0,
      scaleX: (transform.scaleX as number) || 1,
      scaleY: (transform.scaleY as number) || 1,
      opacity: (description.opacity as number) || 1,
      ...this.deserializeDescription(description),
    };
  }
  
  /**
   * Serialize element-specific description
   * Override to add custom properties
   */
  protected serializeDescription(element: CanvasElement): Record<string, unknown> {
    return {
      opacity: element.opacity || 1,
    };
  }
  
  /**
   * Deserialize element-specific description
   * Override to parse custom properties
   */
  protected deserializeDescription(description: Record<string, unknown>): Partial<CanvasElement> {
    // Base implementation returns empty object
    // Subclasses can override to extract custom properties
    void description; // Explicitly mark as intentionally unused
    return {};
  }
  
  /**
   * Generate a unique ID for a new element
   */
  protected generateId(): string {
    return `${this.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
