import React, { useState } from 'react';
import { Badge, Button, ButtonGroup, Card, Form, Modal } from 'react-bootstrap';
import { ArrowDown, ArrowUp, ChevronDoubleDown, ChevronDoubleUp } from 'react-bootstrap-icons';
import { CanvasElement as HandlerCanvasElement } from '../../config/referenceHandlers';
import { getReferenceModel } from '../../config/references';
import { useCanvas } from '../../contexts/CanvasContext';
import { CanvasElement } from '../../types/canvas';
import { ImageLibrary } from '../library/ImageLibrary';

export const ElementInspector: React.FC = () => {
  const { elements, selectedId, updateElement, deleteSelected, bringToFront, sendToBack, bringForward, sendBackward } = useCanvas();
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  
  const selectedElement = elements.find(el => el.id === selectedId);
  if (!selectedElement) {
    return (
      <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Card.Header>
          <h6 className="mb-0">Inspector</h6>
        </Card.Header>
        <Card.Body>
          <div className="text-center text-muted">
            <p>No element selected</p>
            <small>Click an element on the canvas to inspect it</small>
          </div>
        </Card.Body>
      </Card>
    );
  }

  const model = getReferenceModel(selectedElement.type);
  const IconComponent = model?.icon;

  const handleChange = (property: string, value: number) => {
    updateElement(selectedElement.id, { [property]: value });
  };
  
  const rotation = typeof selectedElement.rotation === 'number' ? selectedElement.rotation : 0;
  
  // Extract width and height values safely
  const elementWidth = ('width' in selectedElement && typeof selectedElement.width === 'number') 
    ? selectedElement.width 
    : undefined;
  
  const elementHeight = ('height' in selectedElement && typeof selectedElement.height === 'number') 
    ? selectedElement.height 
    : undefined;

  // Type guards for reference elements
  const isReferenceElement = 'referenceId' in selectedElement;
  const referenceId = isReferenceElement && 'referenceId' in selectedElement && selectedElement.referenceId 
    ? (typeof selectedElement.referenceId === 'number' || typeof selectedElement.referenceId === 'string' ? selectedElement.referenceId : null)
    : null;
  const hasLabel = 'label' in selectedElement;
  const hasOpacity = 'opacity' in selectedElement;
  
  const handleImageSelect = (_imageId: number, imageUrl: string) => {
    if (selectedElement) {
      // Load the image to get dimensions
      const img = new window.Image();
      img.src = imageUrl;
      img.onload = () => {
        const maxWidth = 400;
        const maxHeight = 400;
        let width = img.width;
        let height = img.height;

        // Scale down if too large
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        updateElement(selectedElement.id, { 
          imageUrl,
          width,
          height
        } as Partial<CanvasElement>);
      };
      setShowImageLibrary(false);
    }
  };

  return (
    <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Card.Header>
        <h6 className="mb-0">Inspector</h6>
      </Card.Header>
      <Card.Body style={{ overflow: 'auto', flex: 1 }}>
        {/* Element Type */}
        <div className="mb-3">
          <div className="d-flex align-items-center mb-2">
            {IconComponent ? React.createElement(IconComponent as React.ComponentType<{className?: string}>, { className: "me-2" }) : null}
            <strong>{model?.label || selectedElement.type}</strong>
            {referenceId && (
              <Badge bg="info" className="ms-2">
                Reference #{String(referenceId)}
              </Badge>
            )}
          </div>
          <small className="text-muted">ID: {selectedElement.id}</small>
        </div>

        <hr />

        {/* Element-specific fields rendered by handler */}
        {model?.handler.renderInspectorFields(
          selectedElement as unknown as HandlerCanvasElement,
          updateElement as (id: string, attrs: Partial<HandlerCanvasElement>) => void,
          { setShowImageLibrary }
        )}

        {/* Reference Data (read-only) - shown for reference elements */}
        {hasLabel && 'label' in selectedElement && selectedElement.label ? (
          <div className="mb-3">
            <Form.Label className="fw-bold" style={{ fontSize: '0.9rem' }}>
              Label
            </Form.Label>
            <Form.Control
              type="text"
              value={String(selectedElement.label)}
              readOnly
              size="sm"
              className="bg-light"
            />
          </div>
        ) : null}

        <hr />

        {/* Transform Properties */}
        <div className="mb-2">
          <strong style={{ fontSize: '0.9rem' }}>Transform</strong>
        </div>

        <Form.Group className="mb-3">
          <Form.Label style={{ fontSize: '0.85rem' }}>
            Position X: {Math.round(selectedElement.x)}px
          </Form.Label>
          <Form.Range
            min={0}
            max={800}
            value={selectedElement.x}
            onChange={(e) => handleChange('x', Number(e.target.value))}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label style={{ fontSize: '0.85rem' }}>
            Position Y: {Math.round(selectedElement.y)}px
          </Form.Label>
          <Form.Range
            min={0}
            max={600}
            value={selectedElement.y}
            onChange={(e) => handleChange('y', Number(e.target.value))}
          />
        </Form.Group>

        {typeof elementWidth === 'number' && (
          <Form.Group className="mb-3">
            <Form.Label style={{ fontSize: '0.85rem' }}>
              Width: {Math.round(elementWidth)}px
            </Form.Label>
            <Form.Range
              min={10}
              max={400}
              value={elementWidth}
              onChange={(e) => handleChange('width', Number(e.target.value))}
            />
          </Form.Group>
        )}

        {typeof elementHeight === 'number' && (
          <Form.Group className="mb-3">
            <Form.Label style={{ fontSize: '0.85rem' }}>
              Height: {Math.round(elementHeight)}px
            </Form.Label>
            <Form.Range
              min={10}
              max={400}
              value={elementHeight}
              onChange={(e) => handleChange('height', Number(e.target.value))}
            />
          </Form.Group>
        )}

        <Form.Group className="mb-3">
          <Form.Label style={{ fontSize: '0.85rem' }}>
            Rotation: {Math.round(rotation)}°
          </Form.Label>
          <Form.Range
            min={0}
            max={360}
            value={rotation}
            onChange={(e) => handleChange('rotation', Number(e.target.value))}
          />
        </Form.Group>

        {hasOpacity && 'opacity' in selectedElement && typeof selectedElement.opacity === 'number' ? (
          <Form.Group className="mb-3">
            <Form.Label style={{ fontSize: '0.85rem' }}>
              Opacity: {Math.round(selectedElement.opacity * 100)}%
            </Form.Label>
            <Form.Range
              min={0}
              max={1}
              step={0.1}
              value={selectedElement.opacity}
              onChange={(e) => handleChange('opacity', Number(e.target.value))}
            />
          </Form.Group>
        ) : null}

        <hr />

        {/* Z-Order Controls */}
        <div className="mb-3">
          <Form.Label className="fw-bold" style={{ fontSize: '0.9rem' }}>
            Layer Order
          </Form.Label>
          <ButtonGroup className="w-100 mb-2" size="sm">
            <Button
              variant="outline-secondary"
              onClick={() => bringToFront(selectedElement.id)}
              title="Bring to Front"
            >
              <ChevronDoubleUp size={16} />
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => bringForward(selectedElement.id)}
              title="Bring Forward"
            >
              <ArrowUp size={16} />
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => sendBackward(selectedElement.id)}
              title="Send Backward"
            >
              <ArrowDown size={16} />
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => sendToBack(selectedElement.id)}
              title="Send to Back"
            >
              <ChevronDoubleDown size={16} />
            </Button>
          </ButtonGroup>
        </div>

        <hr />

        {/* Actions */}
        <div className="d-grid">
          <Button
            variant="danger"
            size="sm"
            onClick={deleteSelected}
          >
            Delete Element
          </Button>
        </div>
      </Card.Body>

      {/* Image Library Modal */}
      <Modal 
        show={showImageLibrary} 
        onHide={() => setShowImageLibrary(false)}
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>Select Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ImageLibrary onImageSelect={handleImageSelect} selectionMode={true} />
        </Modal.Body>
      </Modal>
    </Card>
  );
};
