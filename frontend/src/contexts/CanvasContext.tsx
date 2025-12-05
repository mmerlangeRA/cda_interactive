import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CanvasElement as HandlerCanvasElement } from '../config/referenceHandlers';
import { freeImageHandler } from '../config/referenceHandlers/freeImage';
import { freeTextHandler } from '../config/referenceHandlers/freeText';
import { freeVideoHandler } from '../config/referenceHandlers/freeVideo';
import { getReferenceModel } from '../config/references';
import { useLanguage } from '../contexts/LanguageContext';
import { InteractiveElementsAPI } from '../services/api';
import { CanvasElement } from '../types/canvas';
import { InteractiveElementCreateUpdate } from '../types/index';

interface CanvasContextType {
  elements: CanvasElement[];
  selectedId: string | null;
  stageWidth: number;
  stageHeight: number;
  saving: boolean;
  loading: boolean;
  setCanvasDimensions: (height: number) => void;
  addFreeTextElement: () => void;
  addImageElement: (src: string) => void;
  addFreeImageElement: () => void;
  addFreeVideoElement: () => void;
  addVideoElement: (src: string) => void;
  addCircleElement: () => void;
  addRectangleElement: () => void;
  addArrowElement: () => void;
  addReferenceElement: (element: HandlerCanvasElement) => void;
  updateElement: (id: string, attrs: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  deleteSelected: () => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  saveElements: (pageId: number, language: string) => Promise<void>;
  loadElements: (pageId: number, language?: string) => Promise<void>;
  clearElements: () => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stageWidth, setStageWidth] = useState(1200);
  const [stageHeight, setStageHeight] = useState(675); // Default 16:9 ratio
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPageId, setCurrentPageId] = useState<number | null>(null);
  const { language } = useLanguage();

  // Helper function to calculate z_order for new elements
  const getNextZOrder = useCallback((currentElements: CanvasElement[]): number => {
    if (currentElements.length === 0) return 0;
    const maxZOrder = Math.max(...currentElements.map(el => 
      ('z_order' in el ? (el.z_order as number) : 0)
    ));
    return maxZOrder + 1;
  }, []);

  // Helper function to add element with z_order and selection
  const addElementToCanvas = useCallback((element: HandlerCanvasElement) => {
    setElements((prev) => {
      const elementWithZOrder = { ...element, z_order: getNextZOrder(prev) } as unknown as CanvasElement;
      return [...prev, elementWithZOrder];
    });
    setSelectedId(element.id);
  }, [getNextZOrder]);

  // Function to set canvas dimensions maintaining 16:9 aspect ratio
  const setCanvasDimensions = useCallback((height: number) => {
    const width = Math.round(height * (16 / 9));
    setStageWidth(width);
    setStageHeight(height);
  }, []);

  const addFreeTextElement = useCallback(() => {
    const newElement = freeTextHandler.createWithPlaceholder({ x: 100, y: 100 });
    addElementToCanvas(newElement);
  }, [addElementToCanvas]);

  const addFreeImageElement = useCallback(() => {
    const newElement = freeImageHandler.createWithPlaceholder({ x: 100, y: 100 });
    addElementToCanvas(newElement);
  }, [addElementToCanvas]);

  const addFreeVideoElement = useCallback(() => {
    const newElement = freeVideoHandler.createWithPlaceholder({ x: 100, y: 100 });
    addElementToCanvas(newElement);
  }, [addElementToCanvas]);

  const addVideoElement = useCallback((src: string) => {
    // Default video dimensions (16:9 ratio)
    const width = 320;
    const height = 180;

    const newElement = freeVideoHandler.createFromVideo(
      src,
      { x: 100, y: 100 },
      width,
      height
    );
    
    addElementToCanvas(newElement);
  }, [addElementToCanvas]);

  const addCircleElement = useCallback(() => {
    const model = getReferenceModel('circle');
    if (!model || !model.handler.createWithDefaults) return;
    const newElement = model.handler.createWithDefaults!({ x: 100, y: 100 });
    addElementToCanvas(newElement);
  }, [addElementToCanvas]);

  const addRectangleElement = useCallback(() => {
    const model = getReferenceModel('rectangle');
    if (!model || !model.handler.createWithDefaults) return;
    const newElement = model.handler.createWithDefaults!({ x: 100, y: 100 });
    addElementToCanvas(newElement);
  }, [addElementToCanvas]);

  const addArrowElement = useCallback(() => {
    const model = getReferenceModel('arrow');
    if (!model || !model.handler.createWithDefaults) return;
    const newElement = model.handler.createWithDefaults!({ x: 100, y: 100 });
    addElementToCanvas(newElement);
  }, [addElementToCanvas]);

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

      // Use freeImageHandler to create the element
      const newElement = freeImageHandler.createFromImage(
        src,
        { x: 100, y: 100 },
        width,
        height
      );
      
      addElementToCanvas(newElement);
    };
  }, [addElementToCanvas]);

  const addReferenceElement = useCallback((element: HandlerCanvasElement) => {
    addElementToCanvas(element);
  }, [addElementToCanvas]);

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

  const bringToFront = useCallback((id: string) => {
    setElements((prev) => {
      const maxZOrder = Math.max(...prev.map(el => ('z_order' in el ? (el.z_order as number) : 0)));
      return prev.map(el => 
        el.id === id ? { ...el, z_order: maxZOrder + 1 } as unknown as CanvasElement : el
      );
    });
  }, []);

  const sendToBack = useCallback((id: string) => {
    setElements((prev) => {
      const minZOrder = Math.min(...prev.map(el => ('z_order' in el ? (el.z_order as number) : 0)));
      return prev.map(el => 
        el.id === id ? { ...el, z_order: minZOrder - 1 } as unknown as CanvasElement : el
      );
    });
  }, []);

  const bringForward = useCallback((id: string) => {
    setElements((prev) => {
      const element = prev.find(el => el.id === id);
      if (!element) return prev;
      
      const currentZOrder = ('z_order' in element ? (element.z_order as number) : 0);
      return prev.map(el => 
        el.id === id ? { ...el, z_order: currentZOrder + 1 } as unknown as CanvasElement : el
      );
    });
  }, []);

  const sendBackward = useCallback((id: string) => {
    setElements((prev) => {
      const element = prev.find(el => el.id === id);
      if (!element) return prev;
      
      const currentZOrder = ('z_order' in element ? (element.z_order as number) : 0);
      return prev.map(el => 
        el.id === id ? { ...el, z_order: currentZOrder - 1 } as unknown as CanvasElement : el
      );
    });
  }, []);

  const saveElements = useCallback(async (pageId: number, lang: string) => {
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
      
      // Calculate max z_order for new elements
      const maxZOrder = existingElements.length > 0 
        ? Math.max(...existingElements.map(el => el.z_order || 0))
        : -1;
      let nextZOrder = maxZOrder + 1;
      
      // Process each canvas element
      for (const element of elements) {
        keepBusinessIds.add(element.id);
        
        // Get the handler for this element type
        const model = getReferenceModel(element.type);
        if (!model) {
          console.warn(`No handler found for element type: ${element.type}`);
          continue;
        }
        
        // Get existing element to preserve other languages
        const existing = existingMap.get(element.id);
        
        // Use handler's prepareSaveData method - each handler encapsulates its own save logic
        const { descriptions, konva_jsons } = model.handler.prepareSaveData(
          element as unknown as HandlerCanvasElement,
          existing,
          lang
        );
        
        const elementData: InteractiveElementCreateUpdate = {
          page: pageId,
          business_id: element.id,
          type: element.type,
          z_order: ('z_order' in element && typeof (element as any).z_order === 'number') 
            ? (element as any).z_order 
            : (existing ? existing.z_order : nextZOrder++),
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

  const loadElements = useCallback(async (pageId: number, lang?: string) => {
    try {
      setLoading(true);
      setCurrentPageId(pageId);
      const loadLanguage = lang || language;
      
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
        const konvaJson = ielement.konva_jsons?.[loadLanguage] || ielement.konva_jsons?.['en'];
        if (!konvaJson) {
          console.warn(`No Konva JSON found for element ${ielement.business_id} in language ${loadLanguage}`);
          continue;
        }
        
        // Deserialize using the handler
        const canvasElement = model.handler.deserialize(konvaJson as Record<string, unknown>);
        
        // Add z_order from InteractiveElement (not stored in konvaJson)
        const elementWithZOrder = {
          ...canvasElement,
          z_order: ielement.z_order || 0
        };
        
        canvasElements.push(elementWithZOrder as unknown as CanvasElement);
      }
      
      setElements(canvasElements);
      setSelectedId(null);
    } catch (error) {
      console.error('Failed to load elements:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [language]);

  const clearElements = useCallback(() => {
    setElements([]);
    setSelectedId(null);
    setCurrentPageId(null);
  }, []);

  // Reload elements when language changes
  useEffect(() => {
    if (currentPageId) {
      loadElements(currentPageId, language);
    }
  }, [language, currentPageId, loadElements]);

  return (
    <CanvasContext.Provider
      value={{
        elements,
        selectedId,
        stageWidth,
        stageHeight,
        saving,
        loading,
        setCanvasDimensions,
        addFreeTextElement,
        addImageElement,
        addFreeImageElement,
        addFreeVideoElement,
        addVideoElement,
        addCircleElement,
        addRectangleElement,
        addArrowElement,
        addReferenceElement,
        updateElement,
        deleteElement,
        selectElement,
        deleteSelected,
        bringToFront,
        sendToBack,
        bringForward,
        sendBackward,
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
