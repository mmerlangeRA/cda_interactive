import React from 'react';
import { ImageLibrary } from '../components/library/ImageLibrary';
import { TagManager } from '../components/library/TagManager';

/**
 * Image Library Page - Admin Only
 * Access control is handled by the route configuration
 */
const ImageLibraryPage: React.FC = () => {
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
