import Konva from 'konva';
import React, { useRef } from 'react';
import { Layer, Stage } from 'react-konva';
import { useCanvas } from '../../contexts/CanvasContext';
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
          {elements.map((element) => {
            const isSelected = element.id === selectedId;
            if (element.type === 'text') {
              return (
                <TextElement
                  key={element.id}
                  element={element}
                  isSelected={isSelected}
                />
              );
            } else if (element.type === 'image') {
              return (
                <ImageElement
                  key={element.id}
                  element={element}
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
