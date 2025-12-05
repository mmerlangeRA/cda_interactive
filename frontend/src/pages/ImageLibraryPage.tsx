import React from 'react';
import { MediaLibrary } from '../components/library/MediaLibrary';
import { TagManager } from '../components/library/TagManager';

/**
 * Media Library Page - Admin Only
 * Access control is handled by the route configuration
 */
const ImageLibraryPage: React.FC = () => {
  return (
    <div className="container-fluid p-4">
      <h2 className="mb-4">Media Library</h2>
      
      {/* Tag Management Section */}
      <div className="mb-4">
        <TagManager />
      </div>

      {/* Media Library Section */}
      <MediaLibrary />
    </div>
  );
};

export default ImageLibraryPage;
