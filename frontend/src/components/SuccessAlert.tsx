import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { useSuccess } from '../contexts/SuccessContext';

const SuccessAlert: React.FC = () => {
  const { success, clearSuccess } = useSuccess();

  return (
    <ToastContainer className="p-3" position="top-end" style={{ zIndex: 1050 }}>
      <Toast
        show={!!success}
        onClose={clearSuccess}
        bg="success"
        className="text-white"
        delay={3000}
        autohide
      >
        <Toast.Header closeButton>
          <strong className="me-auto">Success</strong>
        </Toast.Header>
        <Toast.Body>{success}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default SuccessAlert;
