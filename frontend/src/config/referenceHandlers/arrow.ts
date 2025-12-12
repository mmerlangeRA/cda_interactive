import React from 'react';
import { Form } from 'react-bootstrap';
import { ReferenceValue } from '../../types/reference';
import { CanvasElement, ReferenceElementHandler, SpawnPosition } from './base';

export class ArrowElementHandler extends ReferenceElementHandler {
  readonly type = 'arrow';
  
  spawn(reference: ReferenceValue, position: SpawnPosition): CanvasElement {
    const pointsField = reference.fields.find(f => f.name === 'points')?.value;
    const points = (Array.isArray(pointsField) ? pointsField : [0, 0, 100, 0]) as number[];
    const stroke = reference.fields.find(f => f.name === 'stroke')?.value as string || '#000000';
    const strokeWidth = reference.fields.find(f => f.name === 'strokeWidth')?.value as number || 2;
    const pointerLength = reference.fields.find(f => f.name === 'pointerLength')?.value as number || 10;
    const pointerWidth = reference.fields.find(f => f.name === 'pointerWidth')?.value as number || 10;
    const lineStyle = reference.fields.find(f => f.name === 'lineStyle')?.value as string || 'solid';
    
    const defaults = this.getDefaultProperties();
    
    return {
      id: this.generateId(),
      type: this.type,
      referenceId: undefined,
      x: position.x,
      y: position.y,
      width: Math.abs(points[2] - points[0]),
      height: Math.abs(points[3] - points[1]),
      rotation: defaults.rotation || 0,
      scaleX: defaults.scaleX || 1,
      scaleY: defaults.scaleY || 1,
      opacity: defaults.opacity || 1,
      points,
      stroke,
      strokeWidth,
      pointerLength,
      pointerWidth,
      lineStyle,
    };
  }
  
  /**
   * Create an arrow element with default properties
   */
  createWithDefaults(position: SpawnPosition): CanvasElement {
    const defaults = this.getDefaultProperties();
    const points = [0, 0, 100, 0]; // Horizontal line
    
    return {
      id: this.generateId(),
      type: this.type,
      referenceId: undefined,
      x: position.x,
      y: position.y,
      width: 100,
      height: 1,
      rotation: defaults.rotation || 0,
      scaleX: defaults.scaleX || 1,
      scaleY: defaults.scaleY || 1,
      opacity: defaults.opacity || 1,
      points,
      stroke: '#000000',
      strokeWidth: 2,
      pointerLength: 10,
      pointerWidth: 10,
      lineStyle: 'solid',
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
      points: element.points || [0, 0, 100, 0],
      stroke: element.stroke || '#000000',
      strokeWidth: element.strokeWidth || 2,
      pointerLength: element.pointerLength || 10,
      pointerWidth: element.pointerWidth || 10,
      lineStyle: element.lineStyle || 'solid',
    };
  }
  
  protected deserializeDescription(description: Record<string, unknown>): Partial<CanvasElement> {
    return {
      points: (description.points as number[]) || [0, 0, 100, 0],
      stroke: (description.stroke as string) || '#000000',
      strokeWidth: (description.strokeWidth as number) || 2,
      pointerLength: (description.pointerLength as number) || 10,
      pointerWidth: (description.pointerWidth as number) || 10,
      lineStyle: (description.lineStyle as string) || 'solid',
    };
  }
  
  /**
   * Render arrow-specific inspector fields
   */
  renderInspectorFields(
    element: CanvasElement,
    updateElement: (id: string, attrs: Partial<CanvasElement>) => void
  ): React.ReactNode {
    return React.createElement(React.Fragment, null,
      React.createElement(Form.Group as any, { className: "mb-3" },
        React.createElement(Form.Label as any, { className: "fw-bold", style: { fontSize: '0.9rem' } }, 
          "Line Style"
        ),
        React.createElement(Form.Select as any, {
          value: String(element.lineStyle || 'solid'),
          onChange: (e: any) => updateElement(element.id, { lineStyle: e.target.value }),
          size: "sm"
        },
          React.createElement('option', { value: 'solid' }, 'Solid'),
          React.createElement('option', { value: 'dotted' }, 'Dotted'),
          React.createElement('option', { value: 'dashed' }, 'Dashed')
        )
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
          "Pointer Length"
        ),
        React.createElement(Form.Control as any, {
          type: "number",
          min: 5,
          max: 30,
          value: Number(element.pointerLength || 10),
          onChange: (e: any) => updateElement(element.id, { pointerLength: Number(e.target.value) }),
          size: "sm"
        })
      ),
      React.createElement(Form.Group as any, { className: "mb-3" },
        React.createElement(Form.Label as any, { className: "fw-bold", style: { fontSize: '0.9rem' } }, 
          "Pointer Width"
        ),
        React.createElement(Form.Control as any, {
          type: "number",
          min: 5,
          max: 30,
          value: Number(element.pointerWidth || 10),
          onChange: (e: any) => updateElement(element.id, { pointerWidth: Number(e.target.value) }),
          size: "sm"
        })
      )
    );
  }
}

// Export singleton instance
export const arrowHandler = new ArrowElementHandler();
