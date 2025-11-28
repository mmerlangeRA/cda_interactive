import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSheet } from '../../contexts/SheetContext';

export const PageViewer: React.FC = () => {
  const { selectedPage, pageElements, isLoading } = useSheet();
  const { language } = useLanguage();

  if (!selectedPage) {
    return (
      <div className="d-flex align-items-center justify-content-center h-100">
        <div className="text-center text-muted">
          <h5>No page selected</h5>
          <p>Select a page from the dropdown above to view its content</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center h-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="bg-white border rounded shadow-sm p-4">
        <h4>Page {selectedPage.number}</h4>
        <p className="text-muted">{selectedPage.description?.[language] || 'No description available'}</p>
        
        <hr />
        
        <div className="mt-4">
          <h6>Content Elements ({pageElements.length})</h6>
          {pageElements.length === 0 ? (
            <div className="alert alert-info">
              No elements on this page yet. Switch to Edit Mode to add content.
            </div>
          ) : (
            <div className="list-group">
              {pageElements.map((element) => (
                <div key={element.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{element.type}</strong>
                      <br />
                      <small className="text-muted">
                        Created: {new Date(element.created_at).toLocaleDateString()}
                      </small>
                    </div>
                    {element.type === 'text' && (
                      <span className="badge bg-primary">Text Element</span>
                    )}
                    {element.type === 'image' && (
                      <span className="badge bg-success">Image Element</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
