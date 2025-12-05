import Konva from 'konva';
import React, { useEffect, useRef } from 'react';
import { Arrow, Circle, Group, Transformer } from 'react-konva';
import { CanvasElement as HandlerCanvasElement } from '../../../config/referenceHandlers';
import { useCanvas } from '../../../contexts/CanvasContext';

interface ArrowElementProps {
  element: HandlerCanvasElement;
  isSelected: boolean;
}

export const ArrowElement: React.FC<ArrowElementProps> = ({ element, isSelected }) => {
  const groupRef = useRef<Konva.Group>(null);
  const arrowRef = useRef<Konva.Arrow>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const startAnchorRef = useRef<Konva.Circle>(null);
  const endAnchorRef = useRef<Konva.Circle>(null);
  const { updateElement, selectElement } = useCanvas();

  const points = (element.points as number[]) || [0, 0, 100, 0];

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    // Only update position if dragging the group itself, not the anchors
    if (e.target === groupRef.current) {
      updateElement(element.id, {
        x: e.target.x(),
        y: e.target.y(),
      } as any);
    }
  };

  const handleStartAnchorDragMove = () => {
    if (startAnchorRef.current && arrowRef.current) {
      const newPoints = [...points];
      newPoints[0] = startAnchorRef.current.x();
      newPoints[1] = startAnchorRef.current.y();
      arrowRef.current.points(newPoints);
    }
  };

  const handleStartAnchorDragEnd = () => {
    if (startAnchorRef.current) {
      const newPoints = [...points];
      newPoints[0] = startAnchorRef.current.x();
      newPoints[1] = startAnchorRef.current.y();
      
      updateElement(element.id, {
        points: newPoints,
      } as any);
    }
  };

  const handleEndAnchorDragMove = () => {
    if (endAnchorRef.current && arrowRef.current) {
      const newPoints = [...points];
      newPoints[2] = endAnchorRef.current.x();
      newPoints[3] = endAnchorRef.current.y();
      arrowRef.current.points(newPoints);
    }
  };

  const handleEndAnchorDragEnd = () => {
    if (endAnchorRef.current) {
      const newPoints = [...points];
      newPoints[2] = endAnchorRef.current.x();
      newPoints[3] = endAnchorRef.current.y();
      
      updateElement(element.id, {
        points: newPoints,
      } as any);
    }
  };

  return (
    <>
      <Group
        ref={groupRef}
        x={element.x}
        y={element.y}
        draggable={!isSelected} // Only draggable when not selected (to allow anchor dragging)
        onClick={() => selectElement(element.id)}
        onTap={() => selectElement(element.id)}
        onDragEnd={handleDragEnd}
      >
        <Arrow
          ref={arrowRef}
          points={points}
          stroke={element.stroke as string || '#000000'}
          strokeWidth={element.strokeWidth as number || 2}
          fill={element.stroke as string || '#000000'}
          pointerLength={element.pointerLength as number || 10}
          pointerWidth={element.pointerWidth as number || 10}
          opacity={element.opacity}
        />
        
        {/* Start anchor point */}
        {isSelected && (
          <>
            <Circle
              ref={startAnchorRef}
              x={points[0]}
              y={points[1]}
              radius={6}
              fill="white"
              stroke="blue"
              strokeWidth={2}
              draggable
              onDragMove={handleStartAnchorDragMove}
              onDragEnd={handleStartAnchorDragEnd}
            />
            {/* End anchor point */}
            <Circle
              ref={endAnchorRef}
              x={points[2]}
              y={points[3]}
              radius={6}
              fill="white"
              stroke="blue"
              strokeWidth={2}
              draggable
              onDragMove={handleEndAnchorDragMove}
              onDragEnd={handleEndAnchorDragEnd}
            />
          </>
        )}
      </Group>
      {isSelected && (
        <Transformer
          ref={transformerRef}
          enabledAnchors={[]} // Disable default anchors since we use custom ones
          boundBoxFunc={(oldBox, newBox) => {
            return newBox;
          }}
        />
      )}
    </>
  );
};
