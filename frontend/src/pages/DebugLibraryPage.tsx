import React, { useState } from 'react';
import { MediaLibrary } from '../components/library/MediaLibrary';
import { LibraryProvider } from '../contexts/LibraryContext';

const DebugLibraryPage: React.FC = () => {
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectionHistory, setSelectionHistory] = useState<Array<{ id: number; url: string; timestamp: string }>>([]);

  const handleImageSelect = (imageId: number, imageUrl: string) => {
    const timestamp = new Date().toLocaleTimeString();
    
    // Update current selection
    setSelectedImageId(imageId);
    setSelectedImageUrl(imageUrl);
    
    // Add to history
    setSelectionHistory(prev => [
      { id: imageId, url: imageUrl, timestamp },
      ...prev.slice(0, 9) // Keep last 10 selections
    ]);

    console.log('Image selected:', { imageId, imageUrl, timestamp });
  };

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4">
        <div className="col">
          <h2>Debug: Image Library Selection Mode</h2>
          <p className="text-muted">
            This page demonstrates the ImageLibrary component in selection mode. 
            Click on any image to select it and see the callback in action.
          </p>
        </div>
      </div>

      <div className="row mb-4">
        {/* Current Selection Panel */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Current Selection</h5>
            </div>
            <div className="card-body">
              {selectedImageId && selectedImageUrl ? (
                <>
                  <div className="mb-3 text-center">
                    <img 
                      src={selectedImageUrl} 
                      alt="Selected"
                      className="img-fluid rounded"
                      style={{ maxHeight: '200px' }}
                    />
                  </div>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td><strong>Image ID:</strong></td>
                        <td>{selectedImageId}</td>
                      </tr>
                      <tr>
                        <td><strong>Image URL:</strong></td>
                        <td className="text-break small">{selectedImageUrl}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="d-grid">
                    <button 
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => {
                        setSelectedImageId(null);
                        setSelectedImageUrl(null);
                      }}
                    >
                      Clear Selection
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-muted text-center mb-0">
                  No image selected yet. Click on an image below to select it.
                </p>
              )}
            </div>
          </div>

          {/* Selection History */}
          <div className="card mt-3">
            <div className="card-header bg-secondary text-white">
              <h6 className="mb-0">Selection History</h6>
            </div>
            <div className="card-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {selectionHistory.length === 0 ? (
                <p className="text-muted small mb-0">No selections yet</p>
              ) : (
                <div className="list-group list-group-flush">
                  {selectionHistory.map((item, index) => (
                    <div key={index} className="list-group-item px-0 py-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>ID:</strong> {item.id}
                          <br />
                          <small className="text-muted">{item.timestamp}</small>
                        </div>
                        <img 
                          src={item.url} 
                          alt={`Selection ${index}`}
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          className="rounded"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Image Library in Selection Mode */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Image Library (Selection Mode)</h5>
            </div>
            <div className="card-body">
              <div className="alert alert-info">
                <strong>Selection Mode Active:</strong> Click the "Select" button on any image to select it. 
                The Edit and Delete buttons are hidden in this mode and replaced with a Select button.
              </div>
              <LibraryProvider>
                <MediaLibrary 
                  selectionMode={true}
                  onMediaSelect={handleImageSelect}
                />
              </LibraryProvider>
            </div>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="row mt-4">
        <div className="col">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Usage Example</h5>
            </div>
            <div className="card-body">
              <pre className="bg-light p-3 rounded">
{`import { MediaLibrary } from '../components/library/MediaLibrary';
import { LibraryProvider } from '../contexts/LibraryContext';

function MyComponent() {
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const handleImageSelect = (imageId: number, imageUrl: string) => {
    setSelectedImageId(imageId);
    setSelectedImageUrl(imageUrl);
    console.log('Selected:', imageId, imageUrl);
  };

  return (
    <LibraryProvider>
      <MediaLibrary 
        selectionMode={true}
        onMediaSelect={handleImageSelect}
      />
    </LibraryProvider>
  );
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugLibraryPage;
