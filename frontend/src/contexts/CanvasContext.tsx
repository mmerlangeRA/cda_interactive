import React, { createContext, useCallback, useContext, useState } from 'react';
import { CanvasElement, ImageElement, TextElement } from '../types/canvas';

interface CanvasContextType {
  elements: CanvasElement[];
  selectedId: string | null;
  stageWidth: number;
  stageHeight: number;
  addTextElement: () => void;
  addImageElement: (src: string) => void;
  updateElement: (id: string, attrs: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  deleteSelected: () => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stageWidth] = useState(1200);
  const [stageHeight] = useState(800);

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

  return (
    <CanvasContext.Provider
      value={{
        elements,
        selectedId,
        stageWidth,
        stageHeight,
        addTextElement,
        addImageElement,
        updateElement,
        deleteElement,
        selectElement,
        deleteSelected,
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
