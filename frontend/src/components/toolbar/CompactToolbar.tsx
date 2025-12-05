import React, { useState } from 'react';
import { Badge, Button, ButtonGroup, Dropdown, Form, ListGroup, Modal, Spinner } from 'react-bootstrap';
import { ArrowRight, CameraVideo, ChevronDown, Circle, Image, Save, Square, Trash, TypeBold } from 'react-bootstrap-icons';
import { REFERENCE_TYPES, getReferenceModel } from '../../config/references';
import { useCanvas } from '../../contexts/CanvasContext';
import { useError } from '../../contexts/ErrorContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useReference } from '../../contexts/ReferenceContext';
import { useSheet } from '../../contexts/SheetContext';
import { useSuccess } from '../../contexts/SuccessContext';
import { getReference } from '../../services/reference';
import { ReferenceValue, ReferenceValueList } from '../../types/reference';

interface CompactToolbarProps {
  onSpawnReference: (reference: ReferenceValue) => void;
}

export const CompactToolbar: React.FC<CompactToolbarProps> = ({ onSpawnReference }) => {
  const { 
    addFreeTextElement, 
    addFreeImageElement,
    addFreeVideoElement,
    addCircleElement,
    addRectangleElement,
    addArrowElement,
    selectedId, 
    deleteSelected, 
    saveElements, 
    saving 
  } = useCanvas();
  const { selectedPage } = useSheet();
  const { setError } = useError();
  const { setSuccess } = useSuccess();
  const { language } = useLanguage();
  const { references, loading: loadingReferences } = useReference();
  const [showReferencesModal, setShowReferencesModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [spawning, setSpawning] = useState<number | null>(null);

  const handleSave = async () => {
    if (!selectedPage) {
      setError('No page selected');
      return;
    }

    try {
      await saveElements(selectedPage.id, language);
      setSuccess('Elements saved successfully');
    } catch (error) {
      setError('Failed to save elements');
      console.error('Save error:', error);
    }
  };

  // Group references by type
  const groupedReferences = references.reduce((acc, ref) => {
    if (!acc[ref.type]) {
      acc[ref.type] = [];
    }
    acc[ref.type].push(ref);
    return acc;
  }, {} as Record<string, ReferenceValueList[]>);

  // Filter references based on search and type
  const filteredReferences = references.filter(ref => {
    const matchesType = !selectedType || ref.type === selectedType;
    const matchesSearch = !searchQuery || 
      (ref.fields_preview?.value && 
       String(ref.fields_preview.value).toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const getReferenceName = (ref: ReferenceValueList): string => {
    return ref.fields_preview?.value as string || `${ref.type} ${ref.id}`;
  };

  const handleSpawnReference = async (refList: ReferenceValueList) => {
    try {
      setSpawning(refList.id);
      const fullReference = await getReference(refList.id);
      onSpawnReference(fullReference);
      setShowReferencesModal(false);
    } catch (error) {
      console.error('Failed to fetch reference details:', error);
      setError('Failed to load reference');
    } finally {
      setSpawning(null);
    }
  };

  return (
    <>
      <div className="bg-light border-bottom" style={{ minHeight: '60px' }}>
        <div className="d-flex align-items-center justify-content-between px-3 py-2">
          <div className="d-flex align-items-center gap-2">
            <ButtonGroup size="sm">
              <Button
                variant="primary"
                onClick={addFreeTextElement}
                className="d-flex align-items-center gap-2"
              >
                <TypeBold size={16} />
                Text
              </Button>
              <Dropdown as={ButtonGroup}>
                <Dropdown.Toggle variant="primary" size="sm" className="d-flex align-items-center gap-2">
                  <Square size={16} />
                  Shapes
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={addCircleElement}>
                    <Circle size={14} className="me-2" />
                    Circle
                  </Dropdown.Item>
                  <Dropdown.Item onClick={addRectangleElement}>
                    <Square size={14} className="me-2" />
                    Rectangle
                  </Dropdown.Item>
                  <Dropdown.Item onClick={addArrowElement}>
                    <ArrowRight size={14} className="me-2" />
                    Arrow
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Button
                variant="primary"
                onClick={addFreeImageElement}
                className="d-flex align-items-center gap-2"
              >
                <Image size={16} />
                Image
              </Button>
              <Button
                variant="primary"
                onClick={addFreeVideoElement}
                className="d-flex align-items-center gap-2"
              >
                <CameraVideo size={16} />
                Video
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowReferencesModal(true)}
                className="d-flex align-items-center gap-2"
              >
                <ChevronDown size={16} />
                References
              </Button>
            </ButtonGroup>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Button
              variant="success"
              size="sm"
              onClick={handleSave}
              disabled={saving || !selectedPage}
              className="d-flex align-items-center gap-2"
            >
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save
                </>
              )}
            </Button>
            {selectedId && (
              <Button
                variant="danger"
                size="sm"
                onClick={deleteSelected}
                className="d-flex align-items-center gap-2"
              >
                <Trash size={16} />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* References Modal */}
      <Modal 
        show={showReferencesModal} 
        onHide={() => setShowReferencesModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Reference</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Search & Filter */}
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Search references..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="sm"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Select
              size="sm"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Types</option>
              {REFERENCE_TYPES.map(refType => (
                <option key={refType.type} value={refType.type}>
                  {refType.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {loadingReferences ? (
              <div className="text-center text-muted py-4">
                <div className="spinner-border spinner-border-sm me-2" />
                Loading references...
              </div>
            ) : filteredReferences.length === 0 ? (
              <div className="text-center text-muted py-4">
                <p>No references found</p>
                <small>Create references in the References page</small>
              </div>
            ) : (
              <div>
                {/* Group by type if no filter selected */}
                {!selectedType ? (
                  REFERENCE_TYPES.map(refType => {
                    const refsOfType = groupedReferences[refType.type] || [];
                    if (refsOfType.length === 0) return null;

                    const Icon = refType.icon;

                    return (
                      <div key={refType.type} className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <Icon className="me-2" />
                          <strong>{refType.label}</strong>
                          <Badge bg="secondary" className="ms-2">
                            {refsOfType.length}
                          </Badge>
                        </div>
                        <ListGroup variant="flush">
                          {refsOfType
                            .filter(ref => 
                              !searchQuery || 
                              getReferenceName(ref).toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map(ref => (
                              <ListGroup.Item
                                key={ref.id}
                                action
                                onClick={() => handleSpawnReference(ref)}
                                disabled={spawning === ref.id}
                                style={{ cursor: 'pointer', padding: '0.5rem 0.75rem' }}
                              >
                                <div className="d-flex justify-content-between align-items-center">
                                  <span style={{ fontSize: '0.9rem' }}>
                                    {spawning === ref.id ? (
                                      <>
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Loading...
                                      </>
                                    ) : (
                                      getReferenceName(ref)
                                    )}
                                  </span>
                                  <Badge bg="light" text="dark" style={{ fontSize: '0.7rem' }}>
                                    v{ref.version}
                                  </Badge>
                                </div>
                              </ListGroup.Item>
                            ))}
                        </ListGroup>
                      </div>
                    );
                  })
                ) : (
                  // Show flat list when filter is active
                  <ListGroup variant="flush">
                    {filteredReferences.map(ref => {
                      const model = getReferenceModel(ref.type);
                      const Icon = model?.icon;

                      return (
                        <ListGroup.Item
                          key={ref.id}
                          action
                          onClick={() => handleSpawnReference(ref)}
                          disabled={spawning === ref.id}
                          style={{ cursor: 'pointer', padding: '0.5rem 0.75rem' }}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                              {Icon && <Icon className="me-2" size={16} />}
                              <span style={{ fontSize: '0.9rem' }}>
                                {spawning === ref.id ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Loading...
                                  </>
                                ) : (
                                  getReferenceName(ref)
                                )}
                              </span>
                            </div>
                            <Badge bg="light" text="dark" style={{ fontSize: '0.7rem' }}>
                              v{ref.version}
                            </Badge>
                          </div>
                        </ListGroup.Item>
                      );
                    })}
                  </ListGroup>
                )}
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};
