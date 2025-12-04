import Konva from 'konva';
import React, { useEffect, useRef } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';
import { CanvasElement } from '../../../config/referenceHandlers';
import { useCanvas } from '../../../contexts/CanvasContext';

interface GabaritElementProps {
  element: CanvasElement;
  isSelected: boolean;
}

export const GabaritElement: React.FC<GabaritElementProps> = ({ element, isSelected }) => {
  const { updateElement, selectElement } = useCanvas();
  const groupRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // Attach transformer when selected
  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    updateElement(element.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale and apply it to width/height
    node.scaleX(1);
    node.scaleY(1);

    updateElement(element.id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(20, node.width() * scaleX),
      height: Math.max(20, node.height() * scaleY),
      rotation: node.rotation(),
    });
  };

  const label = (element.label as string) || 'Gabarit';
  const fill = (element.fill as string) || '#4CAF50';
  const stroke = (element.stroke as string) || '#2E7D32';
  const strokeWidth = (element.strokeWidth as number) || 2;

  return (
    <Group>
      <Group
        ref={groupRef}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation}
        draggable
        onClick={() => selectElement(element.id)}
        onTap={() => selectElement(element.id)}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        <Rect
          width={element.width}
          height={element.height}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          opacity={element.opacity}
          cornerRadius={4}
        />
        <Text
          text={label}
          width={element.width}
          height={element.height}
          align="center"
          verticalAlign="middle"
          fontSize={14}
          fontFamily="Arial"
          fill="#FFFFFF"
          fontStyle="bold"
        />
      </Group>
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </Group>
  );
};
