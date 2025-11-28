import React, { useEffect, useState } from 'react';
import { useError } from '../../contexts/ErrorContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSheet } from '../../contexts/SheetContext';
import { useSuccess } from '../../contexts/SuccessContext';
import { SheetPagesAPI } from '../../services/api';

export const PageDescriptionBanner: React.FC = () => {
  const { selectedPage, isEditMode, selectPage } = useSheet();
  const { language } = useLanguage();
  const { setError } = useError();
  const { setSuccess } = useSuccess();
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedPage?.description) {
      setEditedDescription(selectedPage.description[language] || '');
    }
  }, [selectedPage, language]);

  if (!selectedPage) {
    return null;
  }

  const currentDescription = selectedPage.description?.[language] || '';

  const handleSave = async () => {
    if (!selectedPage || isSaving) return;

    setIsSaving(true);
    try {
      // Update the description for the current language
      const updatedDescription = {
        ...selectedPage.description,
        [language]: editedDescription,
      };

      const response = await SheetPagesAPI.partialUpdate(selectedPage.id, {
        description: updatedDescription,
      });

      // Update the selected page in context
      selectPage(response.data);
      setSuccess('Description updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update description:', error);
      setError('Failed to update description');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedDescription(currentDescription);
    setIsEditing(false);
  };

  return (
    <div className="bg-light border-bottom p-3 mb-3">
      <div className="d-flex align-items-center justify-content-between">
        <div className="flex-grow-1">
          <h5 className="mb-2">
            Page {selectedPage.number}
            {selectedPage.sheet_name && (
              <small className="text-muted ms-2">({selectedPage.sheet_name})</small>
            )}
          </h5>
          {isEditMode && isEditing ? (
            <div className="d-flex gap-2 align-items-center">
              <input
                type="text"
                className="form-control"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder={`Description in ${language.toUpperCase()}`}
                disabled={isSaving}
              />
              <button
                className="btn btn-sm btn-success"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                className="btn btn-sm btn-secondary"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <p className="mb-0 text-muted">
                {currentDescription || 'No description available'}
              </p>
              {isEditMode && (
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
