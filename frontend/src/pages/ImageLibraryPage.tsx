import React from 'react';
import { ImageLibrary } from '../components/library/ImageLibrary';
import { TagManager } from '../components/library/TagManager';
import { useAuth } from '../contexts/AuthContext';

const ImageLibraryPage: React.FC = () => {
  const { user } = useAuth();

  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN';

  if (!isAdmin) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Access Denied</h4>
          <p>Only administrators can access the Image Library.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <h2 className="mb-4">Image Library</h2>
      
      {/* Tag Management Section */}
      <div className="mb-4">
        <TagManager />
      </div>

      {/* Image Library Section */}
      <ImageLibrary />
    </div>
  );
};

export default ImageLibraryPage;
