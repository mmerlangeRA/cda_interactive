import Konva from 'konva';
import React, { useEffect, useRef, useState } from 'react';
import { Image, Transformer } from 'react-konva';
import { useCanvas } from '../../../contexts/CanvasContext';
import { ImageElement as ImageElementType } from '../../../types/canvas';

interface ImageElementProps {
  element: ImageElementType;
  isSelected: boolean;
}

export const ImageElement: React.FC<ImageElementProps> = ({ element, isSelected }) => {
  const { updateElement, selectElement } = useCanvas();
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = element.src;
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      setImage(img);
    };
  }, [element.src]);

  useEffect(() => {
    if (isSelected && transformerRef.current && imageRef.current) {
      transformerRef.current.nodes([imageRef.current]);
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
    const node = imageRef.current;
    if (node) {
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      // Reset scale
      node.scaleX(1);
      node.scaleY(1);

      updateElement(element.id, {
        x: node.x(),
        y: node.y(),
        width: Math.max(node.width() * scaleX, 20),
        height: Math.max(node.height() * scaleY, 20),
        rotation: node.rotation(),
      });
    }
  };

  if (!image) {
    return null;
  }

  return (
    <>
      <Image
        ref={imageRef}
        image={image}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation}
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
            // Limit resize
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
