import React, { useState } from 'react';
import { ImageLibrary, ImageLibraryListItem } from '../../types/library';
import { FieldType } from '../../types/reference';
import { MediaLibrary } from '../library/MediaLibrary';

interface FieldInputProps {
  name: string;
  label: string;
  type: FieldType;
  value: string | number | null;
  imageValue?: ImageLibrary | ImageLibraryListItem | null;
  required: boolean;
  onChange: (value: string | number | null, imageId?: number | null) => void;
}

export const FieldInput: React.FC<FieldInputProps> = ({
  name,
  label,
  type,
  value,
  imageValue,
  required,
  onChange,
}) => {
  const [showImageSelector, setShowImageSelector] = useState(false);

  const handleImageSelect = (imageId: number) => {
    onChange(null, imageId);
    setShowImageSelector(false);
  };

  const handleClearImage = () => {
    onChange(null, null);
  };

  // String input
  if (type === 'string') {
    return (
      <div className="mb-3">
        <label htmlFor={name} className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
        <input
          type="text"
          className="form-control"
          id={name}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        />
      </div>
    );
  }

  // Integer input
  if (type === 'int') {
    return (
      <div className="mb-3">
        <label htmlFor={name} className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
        <input
          type="number"
          step="1"
          className="form-control"
          id={name}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value ? parseInt(e.target.value, 10) : null)}
          required={required}
        />
      </div>
    );
  }

  // Float input
  if (type === 'float') {
    return (
      <div className="mb-3">
        <label htmlFor={name} className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
        <input
          type="number"
          step="0.01"
          className="form-control"
          id={name}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : null)}
          required={required}
        />
      </div>
    );
  }

  // Image input
  if (type === 'image') {
    return (
      <div className="mb-3">
        <label className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
        {imageValue ? (
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <img
                  src={imageValue.file_url}
                  alt={imageValue.name}
                  style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }}
                />
                <div className="flex-grow-1">
                  <strong>{imageValue.name}</strong>
                  <p className="text-muted small mb-0">{imageValue.description}</p>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={handleClearImage}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => setShowImageSelector(true)}
            >
              Select Image from Library
            </button>
          </div>
        )}

        {/* Image selector modal */}
        {showImageSelector && (
          <div
            className="modal show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowImageSelector(false)}
          >
            <div
              className="modal-dialog modal-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Select Image</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowImageSelector(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <MediaLibrary
                    selectionMode={true}
                    onMediaSelect={(imageId) => handleImageSelect(imageId)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};
