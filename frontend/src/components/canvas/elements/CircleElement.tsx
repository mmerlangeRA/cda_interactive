import Konva from 'konva';
import React, { useEffect, useRef } from 'react';
import { Circle, Transformer } from 'react-konva';
import { CanvasElement as HandlerCanvasElement } from '../../../config/referenceHandlers';
import { useCanvas } from '../../../contexts/CanvasContext';

interface CircleElementProps {
  element: HandlerCanvasElement;
  isSelected: boolean;
}

export const CircleElement: React.FC<CircleElementProps> = ({ element, isSelected }) => {
  const circleRef = useRef<Konva.Circle>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const { updateElement, selectElement } = useCanvas();

  useEffect(() => {
    if (isSelected && transformerRef.current && circleRef.current) {
      transformerRef.current.nodes([circleRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const radius = element.radius as number || 50;
    updateElement(element.id, {
      x: e.target.x() - radius,
      y: e.target.y() - radius,
    } as any);
  };

  const handleTransformEnd = () => {
    const node = circleRef.current;
    if (node) {
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      
      // Update radius based on scale
      const newRadius = (element.radius as number || 50) * Math.max(scaleX, scaleY);

      // Reset scale and apply to radius
      node.scaleX(1);
      node.scaleY(1);

      updateElement(element.id, {
        x: node.x() - newRadius,
        y: node.y() - newRadius,
        radius: newRadius,
        width: newRadius * 2,
        height: newRadius * 2,
        rotation: node.rotation(),
      } as any);
    }
  };

  return (
    <>
      <Circle
        ref={circleRef}
        id={element.id}
        x={element.x + (element.radius as number || 50)}
        y={element.y + (element.radius as number || 50)}
        radius={element.radius as number || 50}
        fill={element.fill as string || 'transparent'}
        stroke={element.stroke as string || '#000000'}
        strokeWidth={element.strokeWidth as number || 2}
        opacity={element.opacity}
        draggable
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
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};
