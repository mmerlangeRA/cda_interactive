import React, { useRef, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { ChevronDown, ChevronUp, Image, Trash, TypeBold } from 'react-bootstrap-icons';
import { useCanvas } from '../../contexts/CanvasContext';
import { useLanguage } from '../../contexts/LanguageContext';

export const Toolbar: React.FC = () => {
  const { t } = useLanguage();
  const { addTextElement, addImageElement, selectedId, deleteSelected } = useCanvas();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleAddImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          addImageElement(result);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
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
                onClick={addTextElement}
                className="d-flex align-items-center gap-2"
              >
                <TypeBold size={18} />
                {t('canvas.toolbar.addText')}
              </Button>
              <Button
                variant="primary"
                onClick={handleAddImage}
                className="d-flex align-items-center gap-2"
              >
                <Image size={18} />
                {t('canvas.toolbar.addImage')}
              </Button>
            </ButtonGroup>
          </div>

          <div className="d-flex align-items-center gap-2">
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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
};
