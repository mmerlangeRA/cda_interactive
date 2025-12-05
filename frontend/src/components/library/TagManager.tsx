import React, { useState } from 'react';
import { Plus, Trash2 } from 'react-bootstrap-icons';
import { useLibrary } from '../../contexts/LibraryContext';
import { ImageTagsAPI } from '../../services/library';

export const TagManager: React.FC = () => {
  const { tags, refreshTags } = useLibrary();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTagName.trim()) {
      alert('Please enter a tag name');
      return;
    }

    setIsCreating(true);
    try {
      await ImageTagsAPI.create({ name: newTagName.trim() });
      await refreshTags();
      setNewTagName('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create tag:', error);
      alert('Failed to create tag. It may already exist.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTag = async (tagId: number, tagName: string) => {
    if (!confirm(`Are you sure you want to delete the tag "${tagName}"? This will not delete the images, just remove the tag.`)) {
      return;
    }

    try {
      await ImageTagsAPI.delete(tagId);
      await refreshTags();
    } catch (error) {
      console.error('Failed to delete tag:', error);
      alert('Failed to delete tag');
    }
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Tag Management</h5>
        <button 
          className="btn btn-sm btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={16} className="me-1" />
          New Tag
        </button>
      </div>
      <div className="card-body">
        {tags.length === 0 ? (
          <p className="text-muted mb-0">No tags yet. Create your first tag to organize images.</p>
        ) : (
          <div className="d-flex flex-wrap gap-2">
            {tags.map(tag => (
              <div 
                key={tag.id} 
                className="badge bg-secondary d-flex align-items-center gap-2"
                style={{ fontSize: '0.9rem', padding: '0.5rem' }}
              >
                <span>{tag.name} ({tag.media_count})</span>
                <button
                  className="btn btn-sm btn-link text-white p-0 border-0"
                  style={{ textDecoration: 'none' }}
                  onClick={() => handleDeleteTag(tag.id, tag.name)}
                  title="Delete tag"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Tag Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Tag</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateTag}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Tag Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="e.g., Vehicle, Equipment, Screw"
                      required
                      autoFocus
                    />
                    <small className="text-muted">Tag names should be unique and descriptive</small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={isCreating}
                  >
                    {isCreating ? 'Creating...' : 'Create Tag'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
