import React from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { CanvasEditor } from '../components/canvas/CanvasEditor';
import { PageDescriptionBanner } from '../components/pageView/PageDescriptionBanner';
import { Toolbar } from '../components/toolbar/Toolbar';
import { useError } from '../contexts/ErrorContext';
import { useSuccess } from '../contexts/SuccessContext';
import { logout } from '../services/auth';

const CanvasPage: React.FC = () => {
  const navigate = useNavigate();
  const { setError } = useError();
  const { setSuccess } = useSuccess();

  const handleLogout = async () => {
    try {
      await logout();
      setSuccess('Logged out successfully');
      navigate('/login');
    } catch {
      setError('Failed to logout');
    }
  };

  return (
    <div className="d-flex flex-column vh-100">
      {/* Header */}
      <div className="bg-dark text-white p-3 d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Interactive Canvas Editor</h4>
        <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Toolbar */}
      <Toolbar />

      {/* Main Canvas Area */}
      <Container fluid className="flex-grow-1 p-4 overflow-auto">
        <PageDescriptionBanner />
        <div className="d-flex justify-content-center">
          <CanvasEditor />
        </div>
        
        <div className="mt-4 p-3 bg-light border rounded">
          <h6>Instructions:</h6>
          <ul className="mb-0">
            <li>Click "Add Text" to add text elements to the canvas</li>
            <li>Click "Add Image" to upload and add images</li>
            <li>Drag elements to move them around</li>
            <li>Click on an element to select it (shows resize handles)</li>
            <li>Double-click text to edit it</li>
            <li>Use Delete or Backspace key to delete selected element</li>
            <li>Drag corners to resize elements</li>
          </ul>
        </div>
      </Container>
    </div>
  );
};

export default CanvasPage;
