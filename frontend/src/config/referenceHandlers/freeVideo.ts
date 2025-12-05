import React from 'react';
import { Button, Form } from 'react-bootstrap';
import { ReferenceValue } from '../../types/reference';
import { CanvasElement, ReferenceElementHandler, SpawnPosition } from './base';

// Gray placeholder for video (200x150 gray rectangle with play icon)
const PLACEHOLDER_VIDEO = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect width="200" height="150" fill="%23cccccc"/%3E%3Ctext x="50%25" y="40%25" font-family="Arial" font-size="16" fill="%23666666" text-anchor="middle" dominant-baseline="middle"%3ENo Video%3C/text%3E%3Cpolygon points="90,65 90,85 110,75" fill="%23666666"/%3E%3C/svg%3E';

export class FreeVideoElementHandler extends ReferenceElementHandler {
  readonly type = 'freeVideo';
  
  spawn(reference: ReferenceValue, position: SpawnPosition): CanvasElement {
    // For freeVideo, we don't use a reference but we still need to implement spawn
    const videoUrl = reference.fields.find(f => f.name === 'video' && f.type === 'image')?.image?.file_url || '';
    const description = reference.fields.find(f => f.name === 'description')?.value as string || '';
    
    const defaults = this.getDefaultProperties();
    
    return {
      id: this.generateId(),
      type: this.type,
      referenceId: undefined,
      x: position.x,
      y: position.y,
      width: defaults.width || 320,
      height: defaults.height || 180,
      rotation: defaults.rotation || 0,
      scaleX: defaults.scaleX || 1,
      scaleY: defaults.scaleY || 1,
      opacity: defaults.opacity || 1,
      videoUrl,
      coverImage: undefined, // Will be extracted automatically
      description,
      autoplay: false,
      loop: false,
      muted: true,
    };
  }
  
  /**
   * Create a freeVideo element with default placeholder
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
      width: 320,
      height: 180,
      rotation: defaults.rotation || 0,
      scaleX: defaults.scaleX || 1,
      scaleY: defaults.scaleY || 1,
      opacity: defaults.opacity || 1,
      videoUrl: PLACEHOLDER_VIDEO,
      description: '',
      autoplay: false,
      loop: false,
      muted: true,
    };
  }
  
  /**
   * Create a freeVideo element from a video URL
   * This is the primary way to create freeVideo elements
   */
  createFromVideo(videoUrl: string, position: SpawnPosition, width: number, height: number): CanvasElement {
    const defaults = this.getDefaultProperties();
    
    return {
      id: this.generateId(),
      type: this.type,
      referenceId: undefined,
      x: position.x,
      y: position.y,
      width: width || 320,
      height: height || 180,
      rotation: defaults.rotation || 0,
      scaleX: defaults.scaleX || 1,
      scaleY: defaults.scaleY || 1,
      opacity: defaults.opacity || 1,
      videoUrl,
      description: '',
      autoplay: false,
      loop: false,
      muted: true,
    };
  }
  
  getDefaultProperties(): Partial<CanvasElement> {
    return {
      width: 320,
      height: 180,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
    };
  }
  
  protected serializeDescription(element: CanvasElement): Record<string, unknown> {
    return {
      ...super.serializeDescription(element),
      videoUrl: element.videoUrl,
      coverImage: element.coverImage || null,
      description: element.description || '',
      autoplay: element.autoplay || false,
      loop: element.loop || false,
      muted: element.muted !== undefined ? element.muted : true,
    };
  }
  
  protected deserializeDescription(description: Record<string, unknown>): Partial<CanvasElement> {
    return {
      videoUrl: description.videoUrl as string,
      coverImage: (description.coverImage as string) || undefined,
      description: (description.description as string) || '',
      autoplay: (description.autoplay as boolean) || false,
      loop: (description.loop as boolean) || false,
      muted: description.muted !== undefined ? (description.muted as boolean) : true,
    };
  }
  
  /**
   * Create multilingual serializations for a new freeVideo element
   * Returns serialized versions for EN and FR
   */
  createMultilingualSerialization(element: CanvasElement): Record<string, object> {
    // Use the actual videoUrl from the element, or placeholder if it's still the placeholder
    const videoUrl = element.videoUrl === PLACEHOLDER_VIDEO ? PLACEHOLDER_VIDEO : element.videoUrl;
    
    // Both languages use the same video URL (videos are not language-specific)
    // But descriptions can be different per language
    const enElement = { ...element, videoUrl, description: element.description || '' };
    const enSerialized = this.serialize(enElement);
    
    const frElement = { ...element, videoUrl, description: '' }; // Empty description for FR initially
    const frSerialized = this.serialize(frElement);
    
    return {
      en: enSerialized,
      fr: frSerialized
    };
  }
  
  /**
   * Override prepareSaveData for multilingual behavior
   * New freeVideo elements are initialized with both EN and FR versions
   */
  prepareSaveData(
    element: CanvasElement,
    existing: { descriptions?: Record<string, string>; konva_jsons?: Record<string, object> } | undefined,
    currentLang: string
  ): { descriptions: Record<string, string>; konva_jsons: Record<string, object> } {
    if (!existing) {
      // NEW freeVideo element: Initialize with multilingual versions
      return {
        descriptions: {
          en: 'freeVideo element',
          fr: 'freeVideo element'
        },
        konva_jsons: this.createMultilingualSerialization(element)
      };
    }
    
    // EXISTING freeVideo element: Use default single-language update
    return super.prepareSaveData(element, existing, currentLang);
  }
  
  /**
   * Handle click event in read-only mode
   * Opens video player modal when video element is clicked
   */
  handleClick(element: CanvasElement, context?: Record<string, unknown>): void {
    const showVideoModal = context?.showVideoModal as ((videoUrl: string, autoplay: boolean, loop: boolean, muted: boolean, description: string) => void) | undefined;
    
    if (showVideoModal && element.videoUrl) {
      showVideoModal(
        element.videoUrl as string,
        element.autoplay as boolean || false,
        element.loop as boolean || false,
        element.muted as boolean ?? true,
        element.description as string || ''
      );
    }
  }
  
  /**
   * Render freeVideo-specific inspector fields
   */
  renderInspectorFields(
    element: CanvasElement,
    updateElement: (id: string, attrs: Partial<CanvasElement>) => void,
    context?: Record<string, unknown>
  ): React.ReactNode {
    const setShowMediaLibrary = context?.setShowMediaLibrary as ((show: boolean) => void) | undefined;
    const setShowCoverImageLibrary = context?.setShowCoverImageLibrary as ((show: boolean) => void) | undefined;
    
    return React.createElement(React.Fragment, null,
      // Cover Image Section
      React.createElement(Form.Group as any, { className: "mb-3" },
        React.createElement(Form.Label as any, { className: "fw-bold", style: { fontSize: '0.9rem' } }, 
          "Cover Image"
        ),
        element.coverImage ? React.createElement('div', {
          style: {
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            padding: '0.5rem',
            backgroundColor: '#f8f9fa',
            marginBottom: '0.5rem'
          }
        },
          React.createElement('img', {
            src: String(element.coverImage),
            alt: 'Cover',
            style: {
              maxWidth: '100%',
              maxHeight: '150px',
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto'
            }
          })
        ) : React.createElement('div', {
          style: {
            border: '1px dashed #dee2e6',
            borderRadius: '4px',
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            marginBottom: '0.5rem',
            textAlign: 'center',
            color: '#6c757d'
          }
        }, 'No cover image set'),
        React.createElement('div', { className: 'd-flex gap-2' },
          setShowCoverImageLibrary ? React.createElement(Button as any, {
            variant: "outline-primary",
            size: "sm",
            onClick: () => setShowCoverImageLibrary(true),
            style: { flex: 1 }
          }, element.coverImage ? "Change Cover" : "Select Cover") : null,
          element.videoUrl && element.videoUrl !== PLACEHOLDER_VIDEO ? React.createElement(Button as any, {
            variant: "outline-secondary",
            size: "sm",
            onClick: async () => {
              try {
                const { extractVideoFrame, blobToFile } = await import('../../utils/videoUtils');
                const { ImageLibraryAPI } = await import('../../services/library');
                
                // Extract first frame
                const frameBlob = await extractVideoFrame(String(element.videoUrl));
                const frameFile = blobToFile(frameBlob, `video-cover-${Date.now()}.jpg`);
                
                // Upload to media library
                const response = await ImageLibraryAPI.create({
                  name: `Cover for video ${element.id}`,
                  description: 'Auto-extracted video cover',
                  file: frameFile,
                  media_type: 'image',
                  tag_ids: [],
                  language: null,
                });
                
                // Update element with cover image URL
                updateElement(element.id, { coverImage: response.data.file_url });
              } catch (error) {
                console.error('Failed to extract video frame:', error);
                alert('Failed to extract video frame. Please try again or select an image manually.');
              }
            },
            style: { flex: 1 }
          }, "Extract Frame") : null
        )
      ),
      element.videoUrl ? React.createElement(Form.Group as any, { className: "mb-3" },
        React.createElement(Form.Label as any, { className: "fw-bold", style: { fontSize: '0.9rem' } }, 
          "Video"
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
          React.createElement('video', {
            src: String(element.videoUrl),
            controls: true,
            style: {
              maxWidth: '100%',
              maxHeight: '150px',
              objectFit: 'contain'
            }
          })
        ),
        setShowMediaLibrary ? React.createElement(Button as any, {
          variant: "outline-primary",
          size: "sm",
          onClick: () => setShowMediaLibrary(true),
          className: "w-100"
        }, "Change Video") : null
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
      ),
      React.createElement(Form.Group as any, { className: "mb-3" },
        React.createElement(Form.Check as any, {
          type: "checkbox",
          label: "Autoplay",
          checked: element.autoplay || false,
          onChange: (e: any) => {
            updateElement(element.id, { autoplay: e.target.checked });
          },
          size: "sm"
        })
      ),
      React.createElement(Form.Group as any, { className: "mb-3" },
        React.createElement(Form.Check as any, {
          type: "checkbox",
          label: "Loop",
          checked: element.loop || false,
          onChange: (e: any) => {
            updateElement(element.id, { loop: e.target.checked });
          },
          size: "sm"
        })
      ),
      React.createElement(Form.Group as any, { className: "mb-3" },
        React.createElement(Form.Check as any, {
          type: "checkbox",
          label: "Muted",
          checked: element.muted !== undefined ? element.muted : true,
          onChange: (e: any) => {
            updateElement(element.id, { muted: e.target.checked });
          },
          size: "sm"
        })
      )
    );
  }
}

// Export singleton instance
export const freeVideoHandler = new FreeVideoElementHandler();
