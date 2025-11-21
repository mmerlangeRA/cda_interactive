import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { useError } from '../contexts/ErrorContext';

const ErrorAlert: React.FC = () => {
  const { error, clearError } = useError();

  return (
    <ToastContainer className="p-3" position="top-start" style={{ zIndex: 1050 }}>
      <Toast
        show={!!error}
        onClose={clearError}
        bg="danger"
        className="text-white"
      >
        <Toast.Header closeButton>
          <strong className="me-auto">Error</strong>
        </Toast.Header>
        <Toast.Body>{error}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default ErrorAlert;
