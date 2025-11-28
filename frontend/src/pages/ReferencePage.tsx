import React, { useState } from 'react';
import { ReferenceForm } from '../components/reference/ReferenceForm';
import { ReferenceList } from '../components/reference/ReferenceList';
import { useReference } from '../contexts/ReferenceContext';
import { ReferenceFormData, ReferenceHistory, ReferenceValueList } from '../types/reference';

const ReferencePage: React.FC = () => {
  const {
    createNewReference,
    updateExistingReference,
    fetchReference,
    selectedReference,
    clearSelectedReference,
    fetchHistory,
    history,
  } = useReference();
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editingReference, setEditingReference] = useState<ReferenceValueList | null>(null);

  const handleCreateClick = () => {
    setEditingReference(null);
    clearSelectedReference();
    setShowFormModal(true);
  };

  const handleEditClick = async (reference: ReferenceValueList) => {
    setEditingReference(reference);
    await fetchReference(reference.id);
    setShowFormModal(true);
  };

  const handleViewHistoryClick = async (reference: ReferenceValueList) => {
    setEditingReference(reference);
    await fetchHistory(reference.id);
    setShowHistoryModal(true);
  };

  const handleFormSubmit = async (data: ReferenceFormData) => {
    if (selectedReference) {
      await updateExistingReference(selectedReference.id, data);
    } else {
      await createNewReference(data);
    }
    setShowFormModal(false);
    clearSelectedReference();
  };

  const handleFormCancel = () => {
    setShowFormModal(false);
    clearSelectedReference();
  };

  const handleHistoryClose = () => {
    setShowHistoryModal(false);
    setEditingReference(null);
  };

  return (
    <div className="container-fluid p-4">
      <h2 className="mb-4">Reference Management</h2>

      <ReferenceList
        onCreateClick={handleCreateClick}
        onEditClick={handleEditClick}
        onViewHistoryClick={handleViewHistoryClick}
      />

      {/* Form Modal */}
      {showFormModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={handleFormCancel}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedReference ? 'Edit Reference' : 'Create Reference'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleFormCancel}
                ></button>
              </div>
              <div className="modal-body">
                <ReferenceForm
                  initialData={selectedReference}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormCancel}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={handleHistoryClose}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Version History - {editingReference?.fields_preview?.value || 'Reference'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleHistoryClose}
                ></button>
              </div>
              <div className="modal-body">
                {history.length === 0 ? (
                  <p className="text-muted">No history available.</p>
                ) : (
                  <div className="timeline">
                    {history.map((entry: ReferenceHistory) => (
                      <div key={entry.id} className="card mb-3">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <span className="badge bg-primary">Version {entry.version}</span>
                              <small className="text-muted ms-2">
                                by {entry.changed_by_username || 'Unknown'}
                              </small>
                            </div>
                            <small className="text-muted">
                              {new Date(entry.changed_at).toLocaleString()}
                            </small>
                          </div>
                          <div className="mt-2">
                            <strong>Changes:</strong>
                            <pre className="bg-light p-2 mt-1 rounded">
                              {JSON.stringify(entry.changes, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleHistoryClose}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferencePage;
