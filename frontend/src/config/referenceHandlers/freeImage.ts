import React from 'react';
import { Button, Form } from 'react-bootstrap';
import { ReferenceValue } from '../../types/reference';
import { CanvasElement, ReferenceElementHandler, SpawnPosition } from './base';

// Gray placeholder image (200x150 gray rectangle)
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect width="200" height="150" fill="%23cccccc"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="16" fill="%23666666" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';

export class FreeImageElementHandler extends ReferenceElementHandler {
  readonly type = 'freeImage';
  
  spawn(reference: ReferenceValue, position: SpawnPosition): CanvasElement {
    // For freeImage, we don't use a reference but we still need to implement spawn
    // This can be used if we ever want to spawn from a template
    const imageUrl = reference.fields.find(f => f.name === 'image' && f.type === 'image')?.image?.file_url || '';
    const description = reference.fields.find(f => f.name === 'description')?.value as string || '';
    
    const defaults = this.getDefaultProperties();
    
    return {
      id: this.generateId(),
      type: this.type,
      referenceId: undefined, // No reference for free images
      x: position.x,
      y: position.y,
      width: defaults.width || 100,
      height: defaults.height || 100,
      rotation: defaults.rotation || 0,
      scaleX: defaults.scaleX || 1,
      scaleY: defaults.scaleY || 1,
      opacity: defaults.opacity || 1,
      imageUrl,
      description,
    };
  }
  
  /**
   * Create a freeImage element with default placeholder
   * Used when spawning from toolbar
   */
  createWithPlaceholder(position: SpawnPosition): CanvasElement {
    const defaults = this.getDefaultProperties();
    
    return {
      id: this.generateId(),
      type: this.type,
      referenceId: undefined,
      x: position.x,
      y: position.y,
      width: 200,
      height: 150,
      rotation: defaults.rotation || 0,
      scaleX: defaults.scaleX || 1,
      scaleY: defaults.scaleY || 1,
      opacity: defaults.opacity || 1,
      imageUrl: PLACEHOLDER_IMAGE,
      description: '',
    };
  }
  
  /**
   * Create a freeImage element from an image URL
   * This is the primary way to create freeImage elements
   */
  createFromImage(imageUrl: string, position: SpawnPosition, width: number, height: number): CanvasElement {
    const defaults = this.getDefaultProperties();
    
    return {
      id: this.generateId(),
      type: this.type,
      referenceId: undefined, // No reference for free images
      x: position.x,
      y: position.y,
      width: width || defaults.width || 100,
      height: height || defaults.height || 100,
      rotation: defaults.rotation || 0,
      scaleX: defaults.scaleX || 1,
      scaleY: defaults.scaleY || 1,
      opacity: defaults.opacity || 1,
      imageUrl,
      description: '', // Empty description by default
    };
  }
  
  getDefaultProperties(): Partial<CanvasElement> {
    return {
      width: 100,
      height: 100,
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
      description: element.description || '',
    };
  }
  
  protected deserializeDescription(description: Record<string, unknown>): Partial<CanvasElement> {
    return {
      imageUrl: description.imageUrl as string,
      description: (description.description as string) || '',
    };
  }
  
  /**
   * Create multilingual serializations for a new freeImage element
   * Returns serialized versions for EN and FR with default placeholder images
   */
  createMultilingualSerialization(element: CanvasElement): Record<string, object> {
    // For now, both languages use the same grey placeholder
    // In the future, this could be customized per language
    const enElement = { ...element, imageUrl: PLACEHOLDER_IMAGE, description: '' };
    const enSerialized = this.serialize(enElement);
    
    const frElement = { ...element, imageUrl: PLACEHOLDER_IMAGE, description: '' };
    const frSerialized = this.serialize(frElement);
    
    return {
      en: enSerialized,
      fr: frSerialized
    };
  }
  
  /**
   * Override prepareSaveData for multilingual behavior
   * New freeImage elements are initialized with both EN and FR versions
   */
  prepareSaveData(
    element: CanvasElement,
    existing: { descriptions?: Record<string, string>; konva_jsons?: Record<string, object> } | undefined,
    currentLang: string
  ): { descriptions: Record<string, string>; konva_jsons: Record<string, object> } {
    if (!existing) {
      // NEW freeImage element: Initialize with multilingual versions
      return {
        descriptions: {
          en: 'freeImage element',
          fr: 'freeImage element'
        },
        konva_jsons: this.createMultilingualSerialization(element)
      };
    }
    
    // EXISTING freeImage element: Use default single-language update
    return super.prepareSaveData(element, existing, currentLang);
  }
  
  /**
   * Render freeImage-specific inspector fields
   */
  renderInspectorFields(
    element: CanvasElement,
    updateElement: (id: string, attrs: Partial<CanvasElement>) => void,
    context?: Record<string, unknown>
  ): React.ReactNode {
    const setShowImageLibrary = context?.setShowImageLibrary as ((show: boolean) => void) | undefined;
    
    return React.createElement(React.Fragment, null,
      element.imageUrl ? React.createElement(Form.Group as any, { className: "mb-3" },
        React.createElement(Form.Label as any, { className: "fw-bold", style: { fontSize: '0.9rem' } }, 
          "Image"
        ),
        React.createElement('div', {
          style: {
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            padding: '0.5rem',
            backgroundColor: '#f8f9fa',
            marginBottom: '0.5rem'
          }
        },
          React.createElement('img', {
            src: String(element.imageUrl),
            alt: "Element",
            style: {
              maxWidth: '100%',
              maxHeight: '100px',
              objectFit: 'contain'
            }
          })
        ),
        setShowImageLibrary ? React.createElement(Button as any, {
          variant: "outline-primary",
          size: "sm",
          onClick: () => setShowImageLibrary(true),
          className: "w-100"
        }, "Change Image") : null
      ) : null,
      React.createElement(Form.Group as any, { className: "mb-3" },
        React.createElement(Form.Label as any, { className: "fw-bold", style: { fontSize: '0.9rem' } }, 
          "Description"
        ),
        React.createElement(Form.Control as any, {
          as: "textarea",
          rows: 2,
          value: String(element.description || ''),
          onChange: (e: any) => {
            updateElement(element.id, { description: e.target.value });
          },
          size: "sm",
          placeholder: "Add a description..."
        })
      )
    );
  }
}

// Export singleton instance
export const freeImageHandler = new FreeImageElementHandler();
