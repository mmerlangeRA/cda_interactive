import React from 'react';
import { ShieldX } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';

export const AccessDenied: React.FC = () => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card border-danger">
            <div className="card-body text-center py-5">
              <ShieldX size={64} className="text-danger mb-3" />
              <h3 className="card-title text-danger">Access Denied</h3>
              <p className="card-text text-muted">
                You don't have permission to access this page.
              </p>
              <p className="card-text text-muted small">
                If you believe you should have access, please contact your administrator.
              </p>
              <Link to="/dashboard" className="btn btn-primary mt-3">
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
