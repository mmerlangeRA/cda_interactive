import Konva from 'konva';
import React, { useEffect, useRef } from 'react';
import { Rect, Transformer } from 'react-konva';
import { CanvasElement as HandlerCanvasElement } from '../../../config/referenceHandlers';
import { useCanvas } from '../../../contexts/CanvasContext';

interface RectangleElementProps {
  element: HandlerCanvasElement;
  isSelected: boolean;
}

export const RectangleElement: React.FC<RectangleElementProps> = ({ element, isSelected }) => {
  const rectRef = useRef<Konva.Rect>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const { updateElement, selectElement } = useCanvas();

  useEffect(() => {
    if (isSelected && transformerRef.current && rectRef.current) {
      transformerRef.current.nodes([rectRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    updateElement(element.id, {
      x: e.target.x(),
      y: e.target.y(),
    } as any);
  };

  const handleTransformEnd = () => {
    const node = rectRef.current;
    if (node) {
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      // Reset scale and apply to width/height
      node.scaleX(1);
      node.scaleY(1);

      updateElement(element.id, {
        x: node.x(),
        y: node.y(),
        width: Math.max(10, node.width() * scaleX),
        height: Math.max(10, node.height() * scaleY),
        rotation: node.rotation(),
      } as any);
    }
  };

  return (
    <>
      <Rect
        ref={rectRef}
        id={element.id}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        fill={element.fill as string || 'transparent'}
        stroke={element.stroke as string || '#000000'}
        strokeWidth={element.strokeWidth as number || 2}
        cornerRadius={element.cornerRadius as number || 0}
        rotation={element.rotation}
        opacity={element.opacity}
        draggable={isSelected}
        onClick={() => selectElement(element.id)}
        onTap={() => selectElement(element.id)}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit minimum size
            if (newBox.width < 10 || newBox.height < 10) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};
