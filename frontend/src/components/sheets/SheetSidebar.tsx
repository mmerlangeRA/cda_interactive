import React, { useState } from 'react';
import { Button, Form, ListGroup, Modal } from 'react-bootstrap';
import { ChevronLeft, ChevronRight, Plus } from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useError } from '../../contexts/ErrorContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSheet } from '../../contexts/SheetContext';
import { useSuccess } from '../../contexts/SuccessContext';

export const SheetSidebar: React.FC = () => {
  const { t } = useLanguage();
  const { canCreateSheet } = useAuth();
  const { sheets, selectedSheet, selectSheet, createSheet, isLoading } = useSheet();
  const { setError } = useError();
  const { setSuccess } = useSuccess();
  const [showModal, setShowModal] = useState(false);
  const [newSheetName, setNewSheetName] = useState('');
  const [newSheetBusinessId, setNewSheetBusinessId] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(true); // Collapsed by default

  const handleCreateSheet = async () => {
    if (!newSheetName.trim() || !newSheetBusinessId.trim()) {
      setError(t('sheets.fillAllFields'));
      return;
    }

    try {
      await createSheet({
        name: newSheetName,
        business_id: newSheetBusinessId,
        language: 'en', // Default language
      });
      setSuccess(t('sheets.createdSuccess'));
      setShowModal(false);
      setNewSheetName('');
      setNewSheetBusinessId('');
    } catch {
      setError(t('sheets.createdError'));
    }
  };

  return (
    <div 
      className="h-100 d-flex bg-light border-end position-relative" 
      style={{ 
        width: isCollapsed ? '50px' : '280px',
        transition: 'width 0.3s ease'
      }}
    >
      {/* Toggle Button */}
      <Button
        variant="light"
        size="sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="position-absolute border-0"
        style={{
          right: isCollapsed ? '5px' : '10px',
          top: '10px',
          zIndex: 10,
          padding: '0.25rem 0.5rem'
        }}
        title={isCollapsed ? t('sheets.expand') : t('sheets.collapse')}
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </Button>

      {/* Sidebar Content */}
      <div className="h-100 d-flex flex-column flex-grow-1" style={{ overflow: 'hidden' }}>
        <div className="p-3 border-bottom bg-white" style={{ opacity: isCollapsed ? 0 : 1, transition: 'opacity 0.3s ease' }}>
          <h5 className="mb-2">{t('sheets.title')}</h5>
          {canCreateSheet() && (
            <Button
              variant="primary"
              size="sm"
              className="w-100"
              onClick={() => setShowModal(true)}
              disabled={isCollapsed}
            >
              <Plus size={18} className="me-1" />
              {t('sheets.newSheet')}
            </Button>
          )}
        </div>

        <div 
          className="flex-grow-1 overflow-auto p-2" 
          style={{ 
            opacity: isCollapsed ? 0 : 1, 
            transition: 'opacity 0.3s ease',
            pointerEvents: isCollapsed ? 'none' : 'auto'
          }}
        >
          {isLoading ? (
            <div className="text-center p-3">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">{t('common.loading')}</span>
              </div>
            </div>
          ) : !sheets || sheets.length === 0 ? (
            <div className="text-center text-muted p-3">
              <small>{t('sheets.noSheets')}</small>
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
                    {sheet.business_id} | {sheet.pages_count || 0} {t('sheets.pages')}
                  </small>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </div>
      </div>

      {/* Create Sheet Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('sheets.createSheet')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t('sheets.sheetName')}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t('sheets.enterSheetName')}
                value={newSheetName}
                onChange={(e) => setNewSheetName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('sheets.businessId')}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t('sheets.enterBusinessId')}
                value={newSheetBusinessId}
                onChange={(e) => setNewSheetBusinessId(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleCreateSheet}>
            {t('sheets.createSheet')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
