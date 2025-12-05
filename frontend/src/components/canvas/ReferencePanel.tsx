import React, { useState } from 'react';
import { Badge, Card, Form, ListGroup } from 'react-bootstrap';
import { REFERENCE_TYPES, getReferenceModel } from '../../config/references';
import { useReference } from '../../contexts/ReferenceContext';
import { getReference } from '../../services/reference';
import { ReferenceValue, ReferenceValueList } from '../../types/reference';

interface ReferencePanelProps {
  onSpawnReference: (reference: ReferenceValue) => void;
}

export const ReferencePanel: React.FC<ReferencePanelProps> = ({ onSpawnReference }) => {
  const { references, loading } = useReference();
  const [selectedType, setSelectedType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [spawning, setSpawning] = useState<number | null>(null);

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
      // Fetch full reference details
      const fullReference = await getReference(refList.id);
      onSpawnReference(fullReference);
    } catch (error) {
      console.error('Failed to fetch reference details:', error);
    } finally {
      setSpawning(null);
    }
  };

  return (
    <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Card.Header>
        <h6 className="mb-0">Reference Library</h6>
      </Card.Header>
      <Card.Body style={{ overflow: 'auto', flex: 1 }}>
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

        {loading ? (
          <div className="text-center text-muted">
            <div className="spinner-border spinner-border-sm me-2" />
            Loading references...
          </div>
        ) : filteredReferences.length === 0 ? (
          <div className="text-center text-muted">
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
      </Card.Body>
      <Card.Footer className="text-muted" style={{ fontSize: '0.8rem' }}>
        Click a reference to add it to the canvas
      </Card.Footer>
    </Card>
  );
};
