import React, { useEffect, useState } from 'react';
import { Accordion, Badge, Button, Form, ListGroup, Modal } from 'react-bootstrap';
import { ChevronLeft, ChevronRight, FunnelFill, Plus, XCircle } from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useError } from '../../contexts/ErrorContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSheet } from '../../contexts/SheetContext';
import { useSuccess } from '../../contexts/SuccessContext';
import { BoatsAPI, CabinesAPI, GammeCabinesAPI, LignesAPI, PostesAPI, VarianteGammesAPI } from '../../services/api';
import type { SheetFilters } from '../../types';

export const SheetSidebar: React.FC = () => {
  const { t } = useLanguage();
  const { canCreateSheet } = useAuth();
  const { sheets, selectedSheet, selectSheet, createSheet, isLoading, applyFilters } = useSheet();
  const { setError } = useError();
  const { setSuccess } = useSuccess();
  const [showModal, setShowModal] = useState(false);
  const [newSheetName, setNewSheetName] = useState('');
  const [newSheetBusinessId, setNewSheetBusinessId] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Filter state
  const [filters, setFilters] = useState<SheetFilters>({});
  
  // Filter options
  const [boats, setBoats] = useState<Array<{id: number; internal_id: string; name: string}>>([]);
  const [gammeCabines, setGammeCabines] = useState<Array<{id: number; internal_id: string}>>([]);
  const [varianteGammes, setVarianteGammes] = useState<Array<{id: number; internal_id: string}>>([]);
  const [cabines, setCabines] = useState<Array<{id: number; internal_id: string}>>([]);
  const [lignes, setLignes] = useState<Array<{id: number; internal_id: string; name: string}>>([]);
  const [postes, setPostes] = useState<Array<{id: number; internal_id: string}>>([]);

  // Load filter options
  useEffect(() => {
    loadBoats();
    loadLignes();
  }, []);

  const loadBoats = async () => {
    try {
      const response = await BoatsAPI.list();
      setBoats(response.data);
    } catch (error) {
      console.error('Failed to load boats:', error);
    }
  };

  const loadGammeCabines = async (boatId: number) => {
    try {
      const response = await GammeCabinesAPI.list(boatId);
      setGammeCabines(response.data);
    } catch (error) {
      console.error('Failed to load gamme cabines:', error);
    }
  };

  const loadVarianteGammes = async (gammeId: number) => {
    try {
      const response = await VarianteGammesAPI.list(gammeId);
      setVarianteGammes(response.data);
    } catch (error) {
      console.error('Failed to load variante gammes:', error);
    }
  };

  const loadCabines = async (varianteId: number) => {
    try {
      const response = await CabinesAPI.list(varianteId);
      setCabines(response.data);
    } catch (error) {
      console.error('Failed to load cabines:', error);
    }
  };

  const loadLignes = async () => {
    try {
      const response = await LignesAPI.list();
      setLignes(response.data);
    } catch (error) {
      console.error('Failed to load lignes:', error);
    }
  };

  const loadPostes = async (ligneId: number) => {
    try {
      const response = await PostesAPI.list(ligneId);
      setPostes(response.data);
    } catch (error) {
      console.error('Failed to load postes:', error);
    }
  };

  // Handle filter changes with cascading
  const handleBoatChange = (boatId: string) => {
    const newFilters = { ...filters };
    if (boatId) {
      newFilters.boat = parseInt(boatId);
      loadGammeCabines(parseInt(boatId));
    } else {
      delete newFilters.boat;
      setGammeCabines([]);
    }
    // Clear downstream filters
    delete newFilters.gamme_cabine;
    delete newFilters.variante_gamme;
    delete newFilters.cabine;
    setVarianteGammes([]);
    setCabines([]);
    setFilters(newFilters);
  };

  const handleGammeCabineChange = (gammeId: string) => {
    const newFilters = { ...filters };
    if (gammeId) {
      newFilters.gamme_cabine = parseInt(gammeId);
      loadVarianteGammes(parseInt(gammeId));
    } else {
      delete newFilters.gamme_cabine;
      setVarianteGammes([]);
    }
    // Clear downstream filters
    delete newFilters.variante_gamme;
    delete newFilters.cabine;
    setCabines([]);
    setFilters(newFilters);
  };

  const handleVarianteGammeChange = (varianteId: string) => {
    const newFilters = { ...filters };
    if (varianteId) {
      newFilters.variante_gamme = parseInt(varianteId);
      loadCabines(parseInt(varianteId));
    } else {
      delete newFilters.variante_gamme;
      setCabines([]);
    }
    // Clear downstream filters
    delete newFilters.cabine;
    setFilters(newFilters);
  };

  const handleCabineChange = (cabineId: string) => {
    const newFilters = { ...filters };
    if (cabineId) {
      newFilters.cabine = parseInt(cabineId);
    } else {
      delete newFilters.cabine;
    }
    setFilters(newFilters);
  };

  const handleLigneChange = (ligneId: string) => {
    const newFilters = { ...filters };
    if (ligneId) {
      newFilters.ligne = parseInt(ligneId);
      loadPostes(parseInt(ligneId));
    } else {
      delete newFilters.ligne;
      setPostes([]);
    }
    // Clear downstream filters
    delete newFilters.poste;
    setFilters(newFilters);
  };

  const handlePosteChange = (posteId: string) => {
    const newFilters = { ...filters };
    if (posteId) {
      newFilters.poste = parseInt(posteId);
    } else {
      delete newFilters.poste;
    }
    setFilters(newFilters);
  };

  const handleLigneSensChange = (sens: string) => {
    const newFilters = { ...filters };
    if (sens) {
      newFilters.ligne_sens = sens as 'D' | 'G' | '-';
    } else {
      delete newFilters.ligne_sens;
    }
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    if (applyFilters) {
      applyFilters(filters);
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    setGammeCabines([]);
    setVarianteGammes([]);
    setCabines([]);
    setPostes([]);
    if (applyFilters) {
      applyFilters({});
    }
  };

  const getActiveFilterCount = () => {
    return Object.keys(filters).length;
  };

  const handleCreateSheet = async () => {
    if (!newSheetName.trim() || !newSheetBusinessId.trim()) {
      setError(t('sheets.fillAllFields'));
      return;
    }

    try {
      await createSheet({
        name: newSheetName,
        business_id: newSheetBusinessId,
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
        width: isCollapsed ? '50px' : '320px',
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

        {/* Filter Section */}
        <div 
          style={{ 
            opacity: isCollapsed ? 0 : 1, 
            transition: 'opacity 0.3s ease',
            pointerEvents: isCollapsed ? 'none' : 'auto'
          }}
        >
          <Accordion defaultActiveKey="0" className="border-bottom">
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                <FunnelFill size={16} className="me-2" />
                Filters
                {getActiveFilterCount() > 0 && (
                  <Badge bg="primary" className="ms-2">{getActiveFilterCount()}</Badge>
                )}
              </Accordion.Header>
              <Accordion.Body className="p-2">
                <Form.Group className="mb-2">
                  <Form.Label className="small mb-1">Boat</Form.Label>
                  <Form.Select
                    size="sm"
                    value={filters.boat || ''}
                    onChange={(e) => handleBoatChange(e.target.value)}
                  >
                    <option value="">All</option>
                    {boats.map(boat => (
                      <option key={boat.id} value={boat.id}>
                        {boat.name} ({boat.internal_id})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label className="small mb-1">Gamme Cabine</Form.Label>
                  <Form.Select
                    size="sm"
                    value={filters.gamme_cabine || ''}
                    onChange={(e) => handleGammeCabineChange(e.target.value)}
                    disabled={!filters.boat}
                  >
                    <option value="">All</option>
                    {gammeCabines.map(gamme => (
                      <option key={gamme.id} value={gamme.id}>
                        {gamme.internal_id}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label className="small mb-1">Variante Gamme</Form.Label>
                  <Form.Select
                    size="sm"
                    value={filters.variante_gamme || ''}
                    onChange={(e) => handleVarianteGammeChange(e.target.value)}
                    disabled={!filters.gamme_cabine}
                  >
                    <option value="">All</option>
                    {varianteGammes.map(variante => (
                      <option key={variante.id} value={variante.id}>
                        {variante.internal_id}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label className="small mb-1">Cabine</Form.Label>
                  <Form.Select
                    size="sm"
                    value={filters.cabine || ''}
                    onChange={(e) => handleCabineChange(e.target.value)}
                    disabled={!filters.variante_gamme}
                  >
                    <option value="">All</option>
                    {cabines.map(cabine => (
                      <option key={cabine.id} value={cabine.id}>
                        {cabine.internal_id}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <hr className="my-2" />

                <Form.Group className="mb-2">
                  <Form.Label className="small mb-1">Ligne</Form.Label>
                  <Form.Select
                    size="sm"
                    value={filters.ligne || ''}
                    onChange={(e) => handleLigneChange(e.target.value)}
                  >
                    <option value="">All</option>
                    {lignes.map(ligne => (
                      <option key={ligne.id} value={ligne.id}>
                        {ligne.name} ({ligne.internal_id})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label className="small mb-1">Poste</Form.Label>
                  <Form.Select
                    size="sm"
                    value={filters.poste || ''}
                    onChange={(e) => handlePosteChange(e.target.value)}
                    disabled={!filters.ligne}
                  >
                    <option value="">All</option>
                    {postes.map(poste => (
                      <option key={poste.id} value={poste.id}>
                        {poste.internal_id}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small mb-1">Ligne Sens</Form.Label>
                  <Form.Select
                    size="sm"
                    value={filters.ligne_sens || ''}
                    onChange={(e) => handleLigneSensChange(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="D">D (Droite)</option>
                    <option value="G">G (Gauche)</option>
                    <option value="-">- (Aucun)</option>
                  </Form.Select>
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-grow-1"
                    onClick={handleApplyFilters}
                  >
                    Apply Filters
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleClearFilters}
                    disabled={getActiveFilterCount() === 0}
                  >
                    <XCircle size={16} />
                  </Button>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
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
