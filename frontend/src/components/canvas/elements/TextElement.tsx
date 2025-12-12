import Konva from 'konva';
import React, { useEffect, useRef, useState } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';
import { useCanvas } from '../../../contexts/CanvasContext';
import { TextElement as TextElementType } from '../../../types/canvas';

interface TextElementProps {
  element: TextElementType;
  isSelected: boolean;
}

export const TextElement: React.FC<TextElementProps> = ({ element, isSelected }) => {
  const { updateElement, selectElement } = useCanvas();
  const textRef = useRef<Konva.Text>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isSelected && transformerRef.current && textRef.current) {
      transformerRef.current.nodes([textRef.current]);
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
    const node = textRef.current;
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
        rotation: node.rotation(),
        fontSize: Math.max(element.fontSize * scaleY, 5),
      });
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    selectElement(element.id);
  };

  const handleTextChange = (newText: string) => {
    updateElement(element.id, { text: newText });
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  // Check if box border should be rendered
  const hasBoxBorder = element.boxBorderWidth && element.boxBorderWidth > 0;

  return (
    <>
      {hasBoxBorder ? (
        <Group
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          rotation={element.rotation}
          scaleX={element.scaleX}
          scaleY={element.scaleY}
          opacity={element.opacity}
          draggable={isSelected}
          onClick={() => selectElement(element.id)}
          onTap={() => selectElement(element.id)}
          onDragEnd={handleDragEnd}
          onDblClick={handleDoubleClick}
          onDblTap={handleDoubleClick}
        >
          <Rect
            width={element.width}
            height={element.height}
            stroke={element.boxBorderColor || '#000000'}
            strokeWidth={element.boxBorderWidth || 0}
            fill="transparent"
          />
          <Text
            ref={textRef}
            text={element.text}
            fontSize={element.fontSize}
            fontFamily={element.fontFamily}
            fill={element.fill}
            width={element.width}
            height={element.height}
            align={element.align}
            verticalAlign={element.verticalAlign}
            onTransformEnd={handleTransformEnd}
          />
        </Group>
      ) : (
        <Text
          ref={textRef}
          {...element}
          draggable={isSelected}
          onClick={() => selectElement(element.id)}
          onTap={() => selectElement(element.id)}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
          onDblClick={handleDoubleClick}
          onDblTap={handleDoubleClick}
        />
      )}
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
      {isEditing && (
        <EditableTextInput
          element={element}
          onChange={handleTextChange}
          onBlur={handleBlur}
        />
      )}
    </>
  );
};

interface EditableTextInputProps {
  element: TextElementType;
  onChange: (text: string) => void;
  onBlur: () => void;
}

const EditableTextInput: React.FC<EditableTextInputProps> = ({
  element,
  onChange,
  onBlur,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      onBlur();
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={element.text}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      onKeyDown={handleKeyDown}
      style={{
        position: 'absolute',
        top: `${element.y}px`,
        left: `${element.x}px`,
        fontSize: `${element.fontSize}px`,
        fontFamily: element.fontFamily,
        color: element.fill,
        border: '1px solid #0d6efd',
        padding: '4px',
        background: 'white',
        resize: 'none',
        outline: 'none',
        width: element.width ? `${element.width}px` : 'auto',
        minWidth: '100px',
        zIndex: 1000,
      }}
    />
  );
};
