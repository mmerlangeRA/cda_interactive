import { ReferenceValue } from '../../types/reference';
import { CanvasElement, ReferenceElementHandler, SpawnPosition } from './base';

export class ScrewElementHandler extends ReferenceElementHandler {
  readonly type = 'screw';
  
  spawn(reference: ReferenceValue, position: SpawnPosition): CanvasElement {
    // Extract image URL from reference fields
    const imageField = reference.fields.find(f => f.name === 'image' && f.type === 'image');
    const imageUrl = imageField?.image?.image_url || '';
    
    // Extract label from reference fields
    const labelField = reference.fields.find(f => f.name === 'reference');
    const label = (labelField?.value as string) || `Screw ${reference.id}`;
    
    const defaults = this.getDefaultProperties();
    
    return {
      id: this.generateId(),
      type: this.type,
      referenceId: reference.id,
      x: position.x,
      y: position.y,
      width: defaults.width || 60,
      height: defaults.height || 60,
      rotation: defaults.rotation || 0,
      scaleX: defaults.scaleX || 1,
      scaleY: defaults.scaleY || 1,
      opacity: defaults.opacity || 1,
      imageUrl,
      label,
    };
  }
  
  getDefaultProperties(): Partial<CanvasElement> {
    return {
      width: 60,
      height: 60,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
    };
  }
  
  protected serializeDescription(element: CanvasElement): Record<string, unknown> {
    return {
      ...super.serializeDescription(element),
      imageUrl: element.imageUrl,
      label: element.label,
    };
  }
  
  protected deserializeDescription(description: Record<string, unknown>): Partial<CanvasElement> {
    return {
      imageUrl: description.imageUrl as string,
      label: description.label as string,
    };
  }
}

// Export singleton instance
export const screwHandler = new ScrewElementHandler();
