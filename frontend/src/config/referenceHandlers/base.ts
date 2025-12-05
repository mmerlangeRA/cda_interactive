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
   * Create an element with default properties (optional)
   * Used for elements that don't require a reference (shapes, free elements)
   * Override in subclasses that support direct creation
   */
  createWithDefaults?(position: SpawnPosition): CanvasElement;
  
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
  
  /**
   * Calculate the z_order for a newly spawned element
   * Ensures new elements appear on top of existing ones
   */
  protected calculateInitialZOrder(existingElements: CanvasElement[]): number {
    if (existingElements.length === 0) return 0;
    const maxZOrder = Math.max(...existingElements.map(el => 
      ('z_order' in el ? (el.z_order as number) : 0)
    ));
    return maxZOrder + 1;
  }
  
  /**
   * Prepare save data for this element
   * Encapsulates the logic for creating descriptions and konva_jsons
   * Override this method for element types with special save behavior (e.g., multilingual)
   */
  prepareSaveData(
    element: CanvasElement,
    existing: { descriptions?: Record<string, string>; konva_jsons?: Record<string, object> } | undefined,
    currentLang: string
  ): { descriptions: Record<string, string>; konva_jsons: Record<string, object> } {
    // Default implementation: single-language save
    const serialized = this.serialize(element);
    
    return {
      descriptions: {
        ...(existing?.descriptions || {}),
        [currentLang]: `${this.type} element`
      },
      konva_jsons: {
        ...(existing?.konva_jsons || {}),
        [currentLang]: serialized
      }
    };
  }
  
  /**
   * Render element-specific inspector fields
   * Override this method to provide custom UI for editing element properties
   * @param element - The canvas element to inspect
   * @param updateElement - Function to update element properties
   * @param context - Optional context with utilities (e.g., showImageLibrary modal)
   * @returns React node with element-specific form fields, or null if no custom fields
   */
  renderInspectorFields(
    element: CanvasElement,
    updateElement: (id: string, attrs: Partial<CanvasElement>) => void,
    context?: Record<string, unknown>
  ): React.ReactNode {
    // Default implementation: no custom fields
    // Subclasses can override to provide element-specific UI
    void element;
    void updateElement;
    void context;
    return null;
  }
  
  /**
   * Handle click event on element in read-only mode
   * Override this method to provide custom click behavior for specific element types
   * @param element - The canvas element that was clicked
   * @param context - Optional context with utilities (e.g., modal control functions)
   */
  handleClick?(element: CanvasElement, context?: Record<string, unknown>): void;
}
