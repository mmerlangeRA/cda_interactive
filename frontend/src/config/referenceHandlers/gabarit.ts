import { ReferenceValue } from '../../types/reference';
import { CanvasElement, ReferenceElementHandler, SpawnPosition } from './base';

export class GabaritElementHandler extends ReferenceElementHandler {
  readonly type = 'gabarit';
  
  spawn(reference: ReferenceValue, position: SpawnPosition): CanvasElement {
    // Extract label from reference fields
    const labelField = reference.fields.find(f => f.name === 'reference');
    const label = (labelField?.value as string) || `Gabarit ${reference.id}`;
    
    const defaults = this.getDefaultProperties();
    
    return {
      id: this.generateId(),
      type: this.type,
      referenceId: reference.id,
      x: position.x,
      y: position.y,
      width: defaults.width || 100,
      height: defaults.height || 50,
      rotation: defaults.rotation || 0,
      scaleX: defaults.scaleX || 1,
      scaleY: defaults.scaleY || 1,
      opacity: defaults.opacity || 1,
      label,
      fill: '#4CAF50',
      stroke: '#2E7D32',
      strokeWidth: 2,
    };
  }
  
  getDefaultProperties(): Partial<CanvasElement> {
    return {
      width: 100,
      height: 50,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
    };
  }
  
  protected serializeDescription(element: CanvasElement): Record<string, unknown> {
    return {
      ...super.serializeDescription(element),
      label: element.label,
      fill: element.fill,
      stroke: element.stroke,
      strokeWidth: element.strokeWidth,
    };
  }
  
  protected deserializeDescription(description: Record<string, unknown>): Partial<CanvasElement> {
    return {
      label: description.label as string,
      fill: description.fill as string,
      stroke: description.stroke as string,
      strokeWidth: description.strokeWidth as number,
    };
  }
}

// Export singleton instance
export const gabaritHandler = new GabaritElementHandler();
