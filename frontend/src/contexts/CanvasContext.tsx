import React, { createContext, useCallback, useContext, useState } from 'react';
import { CanvasElement as HandlerCanvasElement } from '../config/referenceHandlers';
import { getReferenceModel } from '../config/references';
import { InteractiveElementsAPI } from '../services/api';
import { CanvasElement, ImageElement, TextElement } from '../types/canvas';
import { InteractiveElementCreateUpdate } from '../types/index';

interface CanvasContextType {
  elements: CanvasElement[];
  selectedId: string | null;
  stageWidth: number;
  stageHeight: number;
  saving: boolean;
  loading: boolean;
  addTextElement: () => void;
  addImageElement: (src: string) => void;
  addReferenceElement: (element: HandlerCanvasElement) => void;
  updateElement: (id: string, attrs: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  deleteSelected: () => void;
  saveElements: (pageId: number, language: string) => Promise<void>;
  loadElements: (pageId: number, language?: string) => Promise<void>;
  clearElements: () => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stageWidth] = useState(1200);
  const [stageHeight] = useState(800);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const addTextElement = useCallback(() => {
    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: 'Double-click to edit',
      x: 100,
      y: 100,
      rotation: 0,
      fontSize: 24,
      fontFamily: 'Arial',
      fill: '#000000',
    };
    setElements((prev) => [...prev, newElement]);
    setSelectedId(newElement.id);
  }, []);

  const addImageElement = useCallback((src: string) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const maxWidth = 400;
      const maxHeight = 400;
      let width = img.width;
      let height = img.height;

      // Scale down if too large
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }

      const newElement: ImageElement = {
        id: `image-${Date.now()}`,
        type: 'image',
        src,
        x: 100,
        y: 100,
        rotation: 0,
        width,
        height,
      };
      setElements((prev) => [...prev, newElement]);
      setSelectedId(newElement.id);
    };
  }, []);

  const addReferenceElement = useCallback((element: HandlerCanvasElement) => {
    // Add reference element from handler - it's already a complete CanvasElement
    // Use 'unknown' as intermediate type for safe conversion
    setElements((prev) => [...prev, element as unknown as CanvasElement]);
    setSelectedId(element.id);
  }, []);

  const updateElement = useCallback((id: string, attrs: Partial<CanvasElement>) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...attrs } as CanvasElement : el))
    );
  }, []);

  const deleteElement = useCallback((id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  }, [selectedId]);

  const selectElement = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const deleteSelected = useCallback(() => {
    if (selectedId) {
      deleteElement(selectedId);
    }
  }, [selectedId, deleteElement]);

  const saveElements = useCallback(async (pageId: number, language: string) => {
    try {
      setSaving(true);
      
      // First, get existing elements for this page
      const response = await InteractiveElementsAPI.list({ page: pageId });
      const existingElements = response.data || [];
      
      // Create a map of existing elements by business_id
      const existingMap = new Map(
        existingElements.map(el => [el.business_id, el])
      );
      
      // Track which business_ids we're keeping
      const keepBusinessIds = new Set<string>();
      
      // Process each canvas element
      for (const element of elements) {
        keepBusinessIds.add(element.id);
        
        // Get the handler for this element type
        const model = getReferenceModel(element.type);
        if (!model) {
          console.warn(`No handler found for element type: ${element.type}`);
          continue;
        }
        
        // Serialize the element to Konva JSON format
        const serialized = model.handler.serialize(element as unknown as HandlerCanvasElement);
        
        // Get existing element to preserve other languages
        const existing = existingMap.get(element.id);
        const existingDescriptions = existing?.descriptions || {};
        const existingKonvaJsons = existing?.konva_jsons || {};
        
        // Update only the current language
        const descriptions = {
          ...existingDescriptions,
          [language]: `${element.type} element`
        };
        
        const konva_jsons = {
          ...existingKonvaJsons,
          [language]: serialized
        };
        
        const elementData: InteractiveElementCreateUpdate = {
          page: pageId,
          business_id: element.id,
          type: element.type,
          descriptions,
          konva_jsons,
        };
        
        if (existing) {
          // Update existing element
          await InteractiveElementsAPI.update(existing.id, elementData);
        } else {
          // Create new element
          await InteractiveElementsAPI.create(elementData);
        }
        
        keepBusinessIds.add(element.id);
      }
      
      // Delete elements that are no longer in the canvas
      for (const existing of existingElements) {
        if (!keepBusinessIds.has(existing.business_id)) {
          await InteractiveElementsAPI.delete(existing.id);
        }
      }
      
      console.log('Elements saved successfully');
    } catch (error) {
      console.error('Failed to save elements:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [elements]);

  const loadElements = useCallback(async (pageId: number, language: string = 'en') => {
    try {
      setLoading(true);
      const response = await InteractiveElementsAPI.list({ page: pageId });
      const interactiveElements = response.data || [];
      
      // Deserialize each element using its handler
      const canvasElements: CanvasElement[] = [];
      for (const ielement of interactiveElements) {
        const model = getReferenceModel(ielement.type);
        if (!model) {
          console.warn(`No handler found for element type: ${ielement.type}`);
          continue;
        }
        
        // Get Konva JSON for the current language
        const konvaJson = ielement.konva_jsons?.[language] || ielement.konva_jsons?.['en'];
        if (!konvaJson) {
          console.warn(`No Konva JSON found for element ${ielement.business_id} in language ${language}`);
          continue;
        }
        
        // Deserialize using the handler
        const canvasElement = model.handler.deserialize(konvaJson as Record<string, unknown>);
        canvasElements.push(canvasElement as unknown as CanvasElement);
      }
      
      setElements(canvasElements);
      setSelectedId(null);
    } catch (error) {
      console.error('Failed to load elements:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearElements = useCallback(() => {
    setElements([]);
    setSelectedId(null);
  }, []);

  return (
    <CanvasContext.Provider
      value={{
        elements,
        selectedId,
        stageWidth,
        stageHeight,
        saving,
        loading,
        addTextElement,
        addImageElement,
        addReferenceElement,
        updateElement,
        deleteElement,
        selectElement,
        deleteSelected,
        saveElements,
        loadElements,
        clearElements,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};
