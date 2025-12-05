import Konva from 'konva';
import React, { useRef } from 'react';
import { Layer, Stage } from 'react-konva';
import { CanvasElement as HandlerCanvasElement } from '../../config/referenceHandlers';
import { useCanvas } from '../../contexts/CanvasContext';
import { ImageElement as ImageElementType, TextElement as TextElementType } from '../../types/canvas';
import { GabaritElement } from './elements/GabaritElement';
import { ScrewElement } from './elements/ScrewElement';
import { ImageElement } from './ImageElement';
import { TextElement } from './TextElement';

export const CanvasEditor: React.FC = () => {
  const {
    elements,
    selectedId,
    stageWidth,
    stageHeight,
    selectElement,
    deleteSelected,
  } = useCanvas();
  const stageRef = useRef(null);

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Deselect when clicking on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectElement(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      deleteSelected();
    }
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{
        outline: 'none',
        border: '2px solid #dee2e6',
        borderRadius: '4px',
        backgroundColor: '#f8f9fa',
        position: 'relative',
      }}
    >
      <Stage
        ref={stageRef}
        width={stageWidth}
        height={stageHeight}
        onClick={handleStageClick}
        onTap={handleStageClick}
        style={{ backgroundColor: 'white' }}
      >
        <Layer>
          {[...elements].sort((a, b) => {
            // Sort by z_order (lower numbers render first/behind)
            const aZOrder = ('z_order' in a ? (a.z_order as number) : 0);
            const bZOrder = ('z_order' in b ? (b.z_order as number) : 0);
            return aZOrder - bZOrder;
          }).map((element) => {
            const isSelected = element.id === selectedId;
            const elementType = (element as {type: string}).type;
            
            // Render based on element type
            if (elementType === 'freeText') {
              return (
                <TextElement
                  key={element.id}
                  element={element as TextElementType}
                  isSelected={isSelected}
                />
              );
            } else if (elementType === 'image' || elementType === 'freeImage') {
              // Both old 'image' and new 'freeImage' use ImageElement component
              // freeImage stores URL in 'imageUrl', old image uses 'src'
              const imageElement = element as unknown as HandlerCanvasElement;
              const imageUrl = (imageElement.imageUrl as string | undefined) || '';
              const srcUrl = (element as ImageElementType).src || '';
              
              const imageElementForDisplay = {
                ...element,
                src: imageUrl || srcUrl,
              } as ImageElementType;
              
              return (
                <ImageElement
                  key={element.id}
                  element={imageElementForDisplay}
                  isSelected={isSelected}
                />
              );
            } else if (elementType === 'screw') {
              return (
                <ScrewElement
                  key={element.id}
                  element={element as unknown as HandlerCanvasElement}
                  isSelected={isSelected}
                />
              );
            } else if (elementType === 'gabarit') {
              return (
                <GabaritElement
                  key={element.id}
                  element={element as unknown as HandlerCanvasElement}
                  isSelected={isSelected}
                />
              );
            }
            
            return null;
          })}
        </Layer>
      </Stage>
    </div>
  );
};
