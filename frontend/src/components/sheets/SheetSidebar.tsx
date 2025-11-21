import React, { useState } from 'react';
import { Button, Form, ListGroup, Modal } from 'react-bootstrap';
import { Plus } from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useError } from '../../contexts/ErrorContext';
import { useSheet } from '../../contexts/SheetContext';
import { useSuccess } from '../../contexts/SuccessContext';

export const SheetSidebar: React.FC = () => {
  const { canCreateSheet } = useAuth();
  const { sheets, selectedSheet, selectSheet, createSheet, isLoading } = useSheet();
  const { setError } = useError();
  const { setSuccess } = useSuccess();
  const [showModal, setShowModal] = useState(false);
  const [newSheetName, setNewSheetName] = useState('');
  const [newSheetBusinessId, setNewSheetBusinessId] = useState('');

  const handleCreateSheet = async () => {
    if (!newSheetName.trim() || !newSheetBusinessId.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await createSheet({
        name: newSheetName,
        business_id: newSheetBusinessId,
        language: 'en', // Default language
      });
      setSuccess('Sheet created successfully');
      setShowModal(false);
      setNewSheetName('');
      setNewSheetBusinessId('');
    } catch {
      setError('Failed to create sheet');
    }
  };

  return (
    <div className="h-100 d-flex flex-column bg-light border-end" style={{ width: '280px' }}>
      <div className="p-3 border-bottom bg-white">
        <h5 className="mb-2">Sheets</h5>
        {canCreateSheet() && (
          <Button
            variant="primary"
            size="sm"
            className="w-100"
            onClick={() => setShowModal(true)}
          >
            <Plus size={18} className="me-1" />
            New Sheet
          </Button>
        )}
      </div>

      <div className="flex-grow-1 overflow-auto p-2">
        {isLoading ? (
          <div className="text-center p-3">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : !sheets || sheets.length === 0 ? (
          <div className="text-center text-muted p-3">
            <small>No sheets available</small>
          </div>
        ) : (
          <ListGroup variant="flush">
            {sheets.map((sheet) => (
              <ListGroup.Item
                key={sheet.id}
                active={selectedSheet?.id === sheet.id}
                action
                onClick={() => selectSheet(sheet)}
                className="border-0"
              >
                <div className="fw-semibold">{sheet.name}</div>
                <small className="text-muted">
                  {sheet.business_id} | {sheet.pages_count || 0} pages
                </small>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </div>

      {/* Create Sheet Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Sheet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Sheet Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter sheet name"
                value={newSheetName}
                onChange={(e) => setNewSheetName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Business ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter business ID"
                value={newSheetBusinessId}
                onChange={(e) => setNewSheetBusinessId(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateSheet}>
            Create Sheet
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
