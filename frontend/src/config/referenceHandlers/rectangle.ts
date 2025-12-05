import React from 'react';
import { Form } from 'react-bootstrap';
import { ReferenceValue } from '../../types/reference';
import { CanvasElement, ReferenceElementHandler, SpawnPosition } from './base';

export class RectangleElementHandler extends ReferenceElementHandler {
  readonly type = 'rectangle';
  
  spawn(reference: ReferenceValue, position: SpawnPosition): CanvasElement {
    const width = reference.fields.find(f => f.name === 'width')?.value as number || 100;
    const height = reference.fields.find(f => f.name === 'height')?.value as number || 80;
    const fill = reference.fields.find(f => f.name === 'fill')?.value as string || 'transparent';
    const stroke = reference.fields.find(f => f.name === 'stroke')?.value as string || '#000000';
    const strokeWidth = reference.fields.find(f => f.name === 'strokeWidth')?.value as number || 2;
    const cornerRadius = reference.fields.find(f => f.name === 'cornerRadius')?.value as number || 0;
    
    const defaults = this.getDefaultProperties();
    
    return {
      id: this.generateId(),
      type: this.type,
      referenceId: undefined,
      x: position.x,
      y: position.y,
      width,
      height,
      rotation: defaults.rotation || 0,
      scaleX: defaults.scaleX || 1,
      scaleY: defaults.scaleY || 1,
      opacity: defaults.opacity || 1,
      fill,
      stroke,
      strokeWidth,
      cornerRadius,
    };
  }
  
  /**
   * Create a rectangle element with default properties
   */
  createWithDefaults(position: SpawnPosition): CanvasElement {
    const defaults = this.getDefaultProperties();
    
    return {
      id: this.generateId(),
      type: this.type,
      referenceId: undefined,
      x: position.x,
      y: position.y,
      width: 100,
      height: 80,
      rotation: defaults.rotation || 0,
      scaleX: defaults.scaleX || 1,
      scaleY: defaults.scaleY || 1,
      opacity: defaults.opacity || 1,
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2,
      cornerRadius: 0,
    };
  }
  
  getDefaultProperties(): Partial<CanvasElement> {
    return {
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
    };
  }
  
  protected serializeDescription(element: CanvasElement): Record<string, unknown> {
    return {
      ...super.serializeDescription(element),
      fill: element.fill || 'transparent',
      stroke: element.stroke || '#000000',
      strokeWidth: element.strokeWidth || 2,
      cornerRadius: element.cornerRadius || 0,
    };
  }
  
  protected deserializeDescription(description: Record<string, unknown>): Partial<CanvasElement> {
    return {
      fill: (description.fill as string) || 'transparent',
      stroke: (description.stroke as string) || '#000000',
      strokeWidth: (description.strokeWidth as number) || 2,
      cornerRadius: (description.cornerRadius as number) || 0,
    };
  }
  
  /**
   * Render rectangle-specific inspector fields
   */
  renderInspectorFields(
    element: CanvasElement,
    updateElement: (id: string, attrs: Partial<CanvasElement>) => void
  ): React.ReactNode {
    return React.createElement(React.Fragment, null,
      React.createElement(Form.Group as any, { className: "mb-3" },
        React.createElement(Form.Label as any, { className: "fw-bold", style: { fontSize: '0.9rem' } }, 
          "Fill Color"
        ),
        React.createElement(Form.Control as any, {
          type: "color",
          value: String(element.fill === 'transparent' ? '#ffffff' : element.fill || '#ffffff'),
          onChange: (e: any) => updateElement(element.id, { fill: e.target.value }),
          size: "sm"
        }),
        React.createElement(Form.Check as any, {
          type: "checkbox",
          label: "Transparent",
          checked: element.fill === 'transparent',
          onChange: (e: any) => updateElement(element.id, { fill: e.target.checked ? 'transparent' : '#ffffff' }),
          className: "mt-1"
        })
      ),
      React.createElement(Form.Group as any, { className: "mb-3" },
        React.createElement(Form.Label as any, { className: "fw-bold", style: { fontSize: '0.9rem' } }, 
          "Stroke Color"
        ),
        React.createElement(Form.Control as any, {
          type: "color",
          value: String(element.stroke || '#000000'),
          onChange: (e: any) => updateElement(element.id, { stroke: e.target.value }),
          size: "sm"
        })
      ),
      React.createElement(Form.Group as any, { className: "mb-3" },
        React.createElement(Form.Label as any, { className: "fw-bold", style: { fontSize: '0.9rem' } }, 
          "Stroke Width"
        ),
        React.createElement(Form.Control as any, {
          type: "number",
          min: 1,
          max: 10,
          value: Number(element.strokeWidth || 2),
          onChange: (e: any) => updateElement(element.id, { strokeWidth: Number(e.target.value) }),
          size: "sm"
        })
      ),
      React.createElement(Form.Group as any, { className: "mb-3" },
        React.createElement(Form.Label as any, { className: "fw-bold", style: { fontSize: '0.9rem' } }, 
          "Corner Radius"
        ),
        React.createElement(Form.Control as any, {
          type: "number",
          min: 0,
          max: 50,
          value: Number(element.cornerRadius || 0),
          onChange: (e: any) => updateElement(element.id, { cornerRadius: Number(e.target.value) }),
          size: "sm"
        })
      )
    );
  }
}

// Export singleton instance
export const rectangleHandler = new RectangleElementHandler();
