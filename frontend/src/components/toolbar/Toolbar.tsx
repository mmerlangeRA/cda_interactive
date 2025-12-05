import React, { useState } from 'react';
import { Button, ButtonGroup, Spinner } from 'react-bootstrap';
import { ChevronDown, ChevronUp, Image, Save, Trash, TypeBold } from 'react-bootstrap-icons';
import { useCanvas } from '../../contexts/CanvasContext';
import { useError } from '../../contexts/ErrorContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSheet } from '../../contexts/SheetContext';
import { useSuccess } from '../../contexts/SuccessContext';

export const Toolbar: React.FC = () => {
  const { t } = useLanguage();
  const { addFreeTextElement, addFreeImageElement, selectedId, deleteSelected, saveElements, saving } = useCanvas();
  const { selectedPage } = useSheet();
  const { setError } = useError();
  const { setSuccess } = useSuccess();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSave = async () => {
    if (!selectedPage) {
      setError('No page selected');
      return;
    }

    try {
      await saveElements(selectedPage.id, 'en'); // TODO: Use current language
      setSuccess('Elements saved successfully');
    } catch (error) {
      setError('Failed to save elements');
      console.error('Save error:', error);
    }
  };

  return (
    <div
      className="bg-light border-bottom"
      style={{
        minHeight: isCollapsed ? '40px' : '70px',
        transition: 'min-height 0.3s ease',
        overflow: 'hidden'
      }}
    >
      {!isCollapsed ? (
        <div className="d-flex align-items-center justify-content-between p-3">
          <div className="d-flex align-items-center gap-2">
            <h5 className="mb-0 me-3">{t('canvas.editor')}</h5>
            <ButtonGroup>
              <Button
                variant="primary"
                onClick={addFreeTextElement}
                className="d-flex align-items-center gap-2"
              >
                <TypeBold size={18} />
                {t('canvas.toolbar.addText')}
              </Button>
              <Button
                variant="primary"
                onClick={addFreeImageElement}
                className="d-flex align-items-center gap-2"
              >
                <Image size={18} />
                {t('canvas.toolbar.addFreeImage')}
              </Button>
            </ButtonGroup>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Button
              variant="success"
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
                  <Save size={18} />
                  Save
                </>
              )}
            </Button>
            {selectedId && (
              <Button
                variant="danger"
                onClick={deleteSelected}
                className="d-flex align-items-center gap-2"
              >
                <Trash size={18} />
                {t('canvas.toolbar.deleteSelected')}
              </Button>
            )}
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setIsCollapsed(true)}
              className="d-flex align-items-center"
              title="Collapse toolbar"
            >
              <ChevronUp size={18} />
            </Button>
          </div>
        </div>
      ) : (
        <div className="d-flex align-items-center justify-content-center p-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setIsCollapsed(false)}
            className="d-flex align-items-center"
            title="Expand toolbar"
          >
            <ChevronDown size={18} />
          </Button>
        </div>
      )}
    </div>
  );
};
