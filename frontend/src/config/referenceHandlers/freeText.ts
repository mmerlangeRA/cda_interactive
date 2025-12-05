import React from 'react';
import { Form } from 'react-bootstrap';
import { ReferenceValue } from '../../types/reference';
import { CanvasElement, ReferenceElementHandler, SpawnPosition } from './base';

export class FreeTextElementHandler extends ReferenceElementHandler {
  readonly type = 'freeText';
  
  spawn(reference: ReferenceValue, position: SpawnPosition): CanvasElement {
    // For freeText, we don't typically use references but implement for completeness
    const description = reference.fields.find(f => f.name === 'text')?.value as string || 'text';
    const fontSize = reference.fields.find(f => f.name === 'fontSize')?.value as number || 24;
    const fill = reference.fields.find(f => f.name === 'fill')?.value as string || '#000000';
    
    const defaults = this.getDefaultProperties();
    
    return {
      id: this.generateId(),
      type: this.type,
      referenceId: undefined, // No reference for free text
      x: position.x,
      y: position.y,
      width: 200, // Default width for text wrapping
      height: 50, // Default height
      rotation: defaults.rotation || 0,
      scaleX: defaults.scaleX || 1,
      scaleY: defaults.scaleY || 1,
      opacity: defaults.opacity || 1,
      text: description, // Keep text field for Konva rendering
      description,
      fontSize,
      fontFamily: 'Arial',
      fill,
    };
  }
  
  /**
   * Create a freeText element with default placeholder text
   * Used when spawning from toolbar
   * Note: Default text will be set per language during save
   */
  createWithPlaceholder(position: SpawnPosition): CanvasElement {
    const defaults = this.getDefaultProperties();
    
    return {
      id: this.generateId(),
      type: this.type,
      referenceId: undefined,
      x: position.x,
      y: position.y,
      width: 200, // Default width for text wrapping
      height: 50, // Default height
      rotation: defaults.rotation || 0,
      scaleX: defaults.scaleX || 1,
      scaleY: defaults.scaleY || 1,
      opacity: defaults.opacity || 1,
      text: 'text', // Keep text field for Konva rendering
      description: 'text', // Will be language-specific during save
      fontSize: 24,
      fontFamily: 'Arial',
      fill: '#000000',
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
      description: element.description || element.text || '',
      fontSize: element.fontSize || 24,
      fontFamily: element.fontFamily || 'Arial',
      fill: element.fill || '#000000',
    };
  }
  
  protected deserializeDescription(description: Record<string, unknown>): Partial<CanvasElement> {
    const textContent = (description.description as string) || 'text';
    return {
      text: textContent, // Keep text field for Konva rendering
      description: textContent,
      fontSize: (description.fontSize as number) || 24,
      fontFamily: (description.fontFamily as string) || 'Arial',
      fill: (description.fill as string) || '#000000',
    };
  }
  
  /**
   * Create multilingual serializations for a new freeText element
   * Returns serialized versions for EN and FR with appropriate default text
   */
  createMultilingualSerialization(element: CanvasElement): Record<string, object> {
    // Create EN version with "text"
    const enElement = { ...element, description: 'text', text: 'text' };
    const enSerialized = this.serialize(enElement);
    
    // Create FR version with "texte"
    const frElement = { ...element, description: 'texte', text: 'texte' };
    const frSerialized = this.serialize(frElement);
    
    return {
      en: enSerialized,
      fr: frSerialized
    };
  }
  
  /**
   * Override prepareSaveData for multilingual behavior
   * New freeText elements are initialized with both EN and FR versions
   */
  prepareSaveData(
    element: CanvasElement,
    existing: { descriptions?: Record<string, string>; konva_jsons?: Record<string, object> } | undefined,
    currentLang: string
  ): { descriptions: Record<string, string>; konva_jsons: Record<string, object> } {
    if (!existing) {
      // NEW freeText element: Initialize with multilingual versions
      return {
        descriptions: {
          en: 'freeText element',
          fr: 'freeText element'
        },
        konva_jsons: this.createMultilingualSerialization(element)
      };
    }
    
    // EXISTING freeText element: Use default single-language update
    return super.prepareSaveData(element, existing, currentLang);
  }
  
  /**
   * Render freeText-specific inspector fields
   */
  renderInspectorFields(
    element: CanvasElement,
    updateElement: (id: string, attrs: Partial<CanvasElement>) => void
  ): React.ReactNode {
    return React.createElement(React.Fragment, null,
      React.createElement(Form.Group as any, { className: "mb-3" },
        React.createElement(Form.Label as any, { className: "fw-bold", style: { fontSize: '0.9rem' } }, 
          "Text Content"
        ),
        React.createElement(Form.Control as any, {
          as: "textarea",
          rows: 3,
          value: String(element.description || ''),
          onChange: (e: any) => {
            const newText = e.target.value;
            updateElement(element.id, { 
              description: newText,
              text: newText
            });
          },
          size: "sm",
          placeholder: "Enter text..."
        })
      ),
      React.createElement(Form.Group as any, { className: "mb-3" },
        React.createElement(Form.Label as any, { className: "fw-bold", style: { fontSize: '0.9rem' } }, 
          "Font Size"
        ),
        React.createElement(Form.Control as any, {
          type: "number",
          min: 8,
          max: 72,
          value: Number(element.fontSize || 24),
          onChange: (e: any) => 
            updateElement(element.id, { fontSize: Number(e.target.value) }),
          size: "sm"
        })
      ),
      React.createElement(Form.Group as any, { className: "mb-3" },
        React.createElement(Form.Label as any, { className: "fw-bold", style: { fontSize: '0.9rem' } }, 
          "Text Color"
        ),
        React.createElement(Form.Control as any, {
          type: "color",
          value: String(element.fill || '#000000'),
          onChange: (e: any) => 
            updateElement(element.id, { fill: e.target.value }),
          size: "sm"
        })
      )
    );
  }
}

// Export singleton instance
export const freeTextHandler = new FreeTextElementHandler();
