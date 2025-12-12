import Konva from 'konva';
import React, { useRef, useState } from 'react';
import { Layer, Stage } from 'react-konva';
import { getHandler, CanvasElement as HandlerCanvasElement } from '../../config/referenceHandlers';
import { useCanvas } from '../../contexts/CanvasContext';
import { ImageElement as ImageElementType, TextElement as TextElementType } from '../../types/canvas';
import { ArrowElement } from './elements/ArrowElement';
import { CircleElement } from './elements/CircleElement';
import { GabaritElement } from './elements/GabaritElement';
import { ImageElement } from './elements/ImageElement';
import { RectangleElement } from './elements/RectangleElement';
import { ScrewElement } from './elements/ScrewElement';
import { TextElement } from './elements/TextElement';
import { VideoElement } from './elements/VideoElement';
import { VideoPlayerModal } from './VideoPlayerModal';

interface CanvasEditorProps {
  readOnly?: boolean;
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({ readOnly = false }) => {
  const {
    elements,
    selectedId,
    stageWidth,
    stageHeight,
    selectElement,
    deleteSelected,
  } = useCanvas();
  const stageRef = useRef(null);
  
  // Video player modal state
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoModalData, setVideoModalData] = useState<{
    videoUrl: string;
    autoplay: boolean;
    loop: boolean;
    muted: boolean;
    description: string;
  }>({
    videoUrl: '',
    autoplay: false,
    loop: false,
    muted: true,
    description: '',
  });

  // Handler for video element clicks in read-only mode
  const handleVideoElementClick = (element: HandlerCanvasElement) => {
    const handler = getHandler(element.type);
    if (handler?.handleClick) {
      const context = {
        showVideoModal: (videoUrl: string, autoplay: boolean, loop: boolean, muted: boolean, description: string) => {
          setVideoModalData({ videoUrl, autoplay, loop, muted, description });
          setShowVideoModal(true);
        }
      };
      handler.handleClick(element, context);
    }
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (readOnly) return; // Disable selection in read-only mode
    
    // Deselect when clicking on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectElement(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (readOnly) return; // Disable deletion in read-only mode
    
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
            const isSelected = readOnly ? false : element.id === selectedId;
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
            } else if (elementType === 'circle') {
              return (
                <CircleElement
                  key={element.id}
                  element={element as unknown as HandlerCanvasElement}
                  isSelected={isSelected}
                />
              );
            } else if (elementType === 'rectangle') {
              return (
                <RectangleElement
                  key={element.id}
                  element={element as unknown as HandlerCanvasElement}
                  isSelected={isSelected}
                />
              );
            } else if (elementType === 'arrow') {
              return (
                <ArrowElement
                  key={element.id}
                  element={element as unknown as HandlerCanvasElement}
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
            } else if (elementType === 'freeVideo') {
              const handler = getHandler('freeVideo');
              return (
                <VideoElement
                  key={element.id}
                  element={element as unknown as HandlerCanvasElement}
                  isSelected={isSelected}
                  readOnly={readOnly}
                  handler={handler}
                  onElementClick={handleVideoElementClick}
                />
              );
            }
            
            return null;
          })}
        </Layer>
      </Stage>
      
      {/* Video Player Modal */}
      <VideoPlayerModal
        show={showVideoModal}
        onHide={() => setShowVideoModal(false)}
        videoUrl={videoModalData.videoUrl}
        autoplay={videoModalData.autoplay}
        loop={videoModalData.loop}
        muted={videoModalData.muted}
        description={videoModalData.description}
      />
    </div>
  );
};
