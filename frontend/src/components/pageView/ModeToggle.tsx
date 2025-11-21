import React from 'react';
import { ButtonGroup, ToggleButton } from 'react-bootstrap';
import { Eye, Pencil } from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSheet } from '../../contexts/SheetContext';

export const ModeToggle: React.FC = () => {
  const { canEditPage } = useAuth();
  const { isEditMode, setEditMode, selectedPage } = useSheet();

  if (!canEditPage() || !selectedPage) {
    return null;
  }

  return (
    <ButtonGroup>
      <ToggleButton
        id="view-mode"
        type="radio"
        variant={!isEditMode ? 'primary' : 'outline-primary'}
        name="mode"
        value="view"
        checked={!isEditMode}
        onChange={() => setEditMode(false)}
      >
        <Eye size={16} className="me-1" />
        View Mode
      </ToggleButton>
      <ToggleButton
        id="edit-mode"
        type="radio"
        variant={isEditMode ? 'primary' : 'outline-primary'}
        name="mode"
        value="edit"
        checked={isEditMode}
        onChange={() => setEditMode(true)}
      >
        <Pencil size={16} className="me-1" />
        Edit Mode
      </ToggleButton>
    </ButtonGroup>
  );
};
