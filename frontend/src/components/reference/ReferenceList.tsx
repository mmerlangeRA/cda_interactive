import React, { useEffect, useState } from 'react';
import { Clock, Pencil, Plus, Search, Trash2 } from 'react-bootstrap-icons';
import { getReferenceModel, REFERENCE_TYPES } from '../../config/references';
import { useReference } from '../../contexts/ReferenceContext';
import { ReferenceValueList } from '../../types/reference';

interface ReferenceListProps {
  onCreateClick: () => void;
  onEditClick: (reference: ReferenceValueList) => void;
  onViewHistoryClick: (reference: ReferenceValueList) => void;
}

export const ReferenceList: React.FC<ReferenceListProps> = ({
  onCreateClick,
  onEditClick,
  onViewHistoryClick,
}) => {
  const { references, loading, fetchReferences, removeReference } = useReference();
  const [selectedType, setSelectedType] = useState<string>('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchReferences();
  }, [fetchReferences]);

  const handleFilter = () => {
    fetchReferences({
      type: selectedType || undefined,
      search: searchText || undefined,
    });
  };

  const handleDelete = async (reference: ReferenceValueList) => {
    if (!confirm(`Are you sure you want to delete this reference?`)) {
      return;
    }

    try {
      await removeReference(reference.id);
    } catch (error) {
      console.error('Failed to delete reference:', error);
    }
  };

  const getTypeLabel = (type: string) => {
    const model = getReferenceModel(type);
    return model?.label || type;
  };

  const getTypeIcon = (type: string) => {
    const model = getReferenceModel(type);
    return model?.icon;
  };

  return (
    <div>
      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <select
                className="form-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">All Types</option>
                {REFERENCE_TYPES.map(type => (
                  <option key={type.type} value={type.type}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search references..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                />
                <button className="btn btn-outline-secondary" onClick={handleFilter}>
                  <Search size={18} />
                </button>
              </div>
            </div>

            <div className="col-md-2">
              <button className="btn btn-primary w-100" onClick={onCreateClick}>
                <Plus size={18} className="me-1" />
                New
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : references.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p>No references found. Create your first reference to get started!</p>
          <button className="btn btn-primary" onClick={onCreateClick}>
            <Plus size={18} className="me-1" />
            Create Reference
          </button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Type</th>
                <th>Reference</th>
                <th>Version</th>
                <th>Created By</th>
                <th>Updated</th>
                <th style={{ width: '200px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {references.map(reference => {
                const IconComponent = getTypeIcon(reference.type);
                return (
                  <tr key={reference.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {IconComponent && <IconComponent size={18} />}
                        <span>{getTypeLabel(reference.type)}</span>
                      </div>
                    </td>
                    <td>
                      {reference.fields_preview ? (
                        <div>
                          <strong>{reference.fields_preview.value}</strong>
                          {reference.fields_preview.language && (
                            <small className="text-muted ms-2">
                              ({reference.fields_preview.language.toUpperCase()})
                            </small>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <span className="badge bg-secondary">v{reference.version}</span>
                    </td>
                    <td>{reference.created_by_username || '-'}</td>
                    <td>
                      <small className="text-muted">
                        {new Date(reference.updated_at).toLocaleDateString()}
                      </small>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => onEditClick(reference)}
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="btn btn-outline-info"
                          onClick={() => onViewHistoryClick(reference)}
                          title="View History"
                        >
                          <Clock size={14} />
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(reference)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
