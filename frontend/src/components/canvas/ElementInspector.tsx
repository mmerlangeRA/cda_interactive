import React from 'react';
import { Badge, Button, Card, Form } from 'react-bootstrap';
import { getReferenceModel } from '../../config/references';
import { useCanvas } from '../../contexts/CanvasContext';

export const ElementInspector: React.FC = () => {
  const { elements, selectedId, updateElement, deleteSelected } = useCanvas();
  
  const selectedElement = elements.find(el => el.id === selectedId);
  if (!selectedElement) {
    return (
      <Card style={{ height: '100%' }}>
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
  const hasImageUrl = 'imageUrl' in selectedElement;
  const hasOpacity = 'opacity' in selectedElement;

  return (
    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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

        {/* Reference Data (read-only) */}
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

        {hasImageUrl && 'imageUrl' in selectedElement && selectedElement.imageUrl ? (
          <div className="mb-3">
            <Form.Label className="fw-bold" style={{ fontSize: '0.9rem' }}>
              Image
            </Form.Label>
            <div 
              style={{
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                padding: '0.5rem',
                backgroundColor: '#f8f9fa'
              }}
            >
              <img 
                src={String(selectedElement.imageUrl)}
                alt="Element"
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100px',
                  objectFit: 'contain'
                }}
              />
            </div>
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
    </Card>
  );
};
