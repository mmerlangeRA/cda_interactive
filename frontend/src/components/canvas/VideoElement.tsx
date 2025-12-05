import Konva from 'konva';
import React, { useEffect, useRef, useState } from 'react';
import { Group, Image, Rect, Text, Transformer } from 'react-konva';
import { CanvasElement, ReferenceElementHandler } from '../../config/referenceHandlers';
import { useCanvas } from '../../contexts/CanvasContext';

interface VideoElementProps {
  element: CanvasElement;
  isSelected: boolean;
  readOnly?: boolean;
  handler?: ReferenceElementHandler;
  onElementClick?: (element: CanvasElement) => void;
}

export const VideoElement: React.FC<VideoElementProps> = ({ 
  element, 
  isSelected, 
  readOnly = false,
  handler,
  onElementClick 
}) => {
  const { updateElement, selectElement } = useCanvas();
  const groupRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const imageRef = useRef<Konva.Image>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  // Load video cover image or create placeholder
  useEffect(() => {
    const coverImageUrl = element.coverImage as string | undefined;
    
    if (coverImageUrl) {
      // Use existing cover image
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = coverImageUrl;
      
      img.onload = () => {
        setImage(img);
      };
      
      img.onerror = () => {
        console.error('Failed to load cover image, creating placeholder');
        createPlaceholderImage();
      };
    } else {
      // No cover image, create placeholder
      createPlaceholderImage();
    }
  }, [element.coverImage, element.width, element.height]);
  
  const createPlaceholderImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = element.width;
    canvas.height = element.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#cccccc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#666666';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Video', canvas.width / 2, canvas.height / 2 - 10);
      // Draw play icon
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 15, canvas.height / 2 + 10);
      ctx.lineTo(canvas.width / 2 - 15, canvas.height / 2 + 30);
      ctx.lineTo(canvas.width / 2 + 5, canvas.height / 2 + 20);
      ctx.closePath();
      ctx.fill();
    }
    const placeholderImg = new window.Image();
    placeholderImg.src = canvas.toDataURL();
    placeholderImg.onload = () => setImage(placeholderImg);
  };

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

  const handleClick = () => {
    if (readOnly && onElementClick) {
      // In read-only mode, trigger custom click handler
      onElementClick(element);
    } else {
      // In edit mode, select the element
      selectElement(element.id);
    }
  };

  return (
    <Group>
      <Group
        ref={groupRef}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation}
        draggable={isSelected && !readOnly}
        onClick={handleClick}
        onTap={handleClick}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        style={readOnly ? { cursor: 'pointer' } : undefined}
      >
        {/* Video thumbnail/poster */}
        {image && (
          <Image
            ref={imageRef}
            image={image}
            width={element.width}
            height={element.height}
            opacity={element.opacity}
          />
        )}
        
        {/* Play icon overlay */}
        <Group>
          {/* Semi-transparent background for play button */}
          <Rect
            x={element.width / 2 - 30}
            y={element.height / 2 - 30}
            width={60}
            height={60}
            fill="rgba(0, 0, 0, 0.5)"
            cornerRadius={30}
          />
          {/* Play triangle */}
          <Text
            text="▶"
            x={element.width / 2 - 15}
            y={element.height / 2 - 20}
            fontSize={40}
            fill="white"
          />
        </Group>
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
