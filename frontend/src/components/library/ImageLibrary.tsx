import React, { useState } from 'react';
import { CheckCircle, Pencil, Plus, Search, Trash2 } from 'react-bootstrap-icons';
import { useLibrary } from '../../contexts/LibraryContext';
import { ImageLibraryAPI } from '../../services/library';
import { ImageLibraryListItem } from '../../types/library';

interface ImageLibraryProps {
  onImageSelect?: (imageId: number, imageUrl: string) => void;
  selectionMode?: boolean;
}

export const ImageLibrary: React.FC<ImageLibraryProps> = ({ 
  onImageSelect,
  selectionMode = false 
}) => {
  const { images, tags, setFilters, refreshImages, isLoading } = useLibrary();
  const [searchText, setSearchText] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingImage, setEditingImage] = useState<ImageLibraryListItem | null>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'en' | 'fr' | 'null'>('all');

  const handleSearch = () => {
    setFilters({
      search: searchText || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      language: selectedLanguage === 'all' ? undefined : selectedLanguage,
    });
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleEditImage = (image: ImageLibraryListItem) => {
    setEditingImage(image);
    setShowEditModal(true);
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      await ImageLibraryAPI.delete(imageId);
      await refreshImages();
    } catch (error) {
      console.error('Failed to delete image:', error);
      alert('Failed to delete image');
    }
  };

  const handleImageSelect = (imageId: number, imageUrl: string) => {
    if (onImageSelect) {
      onImageSelect(imageId, imageUrl);
    }
  };

  return (
    <div>
      {/* Search and Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search images..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button className="btn btn-outline-secondary" onClick={handleSearch}>
                  <Search size={18} />
                </button>
              </div>
            </div>

            <div className="col-md-3">
              <select 
                className="form-select"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as 'all' | 'en' | 'fr' | 'null')}
              >
                <option value="all">All Languages</option>
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="null">No Language</option>
              </select>
            </div>

            <div className="col-md-3">
              <button className="btn btn-secondary w-100" onClick={handleSearch}>
                Apply Filters
              </button>
            </div>
          </div>

          {/* Tag Filters */}
          {tags.length > 0 && (
            <div className="mt-3">
              <label className="form-label">Filter by Tags:</label>
              <div className="d-flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    className={`btn btn-sm ${selectedTags.includes(tag.id) ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleTagToggle(tag.id)}
                  >
                    {tag.name} ({tag.images_count})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Button */}
      {!selectionMode && (
        <div className="mb-3">
          <button 
            className="btn btn-primary"
            onClick={() => setShowUploadModal(true)}
          >
            <Plus size={20} className="me-2" />
            Upload Image
          </button>
        </div>
      )}

      {/* Image Grid */}
      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p>No images found. Upload your first image to get started!</p>
        </div>
      ) : (
        <div className="row g-3">
          {images.map(image => (
            <div key={image.id} className="col-md-3">
              <div className="card h-100">
                <img 
                  src={image.thumbnail_url} 
                  alt={image.name}
                  className="card-img-top"
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <div className="card-body">
                  <h6 className="card-title">{image.name}</h6>
                  {image.description && (
                    <p className="card-text small text-muted">{image.description}</p>
                  )}
                  <div className="d-flex flex-wrap gap-1 mb-2">
                    {image.tags.map(tag => (
                      <span key={tag.id} className="badge bg-secondary">{tag.name}</span>
                    ))}
                  </div>
                  {image.language && (
                    <span className="badge bg-info">{image.language.toUpperCase()}</span>
                  )}
                </div>
                <div className="card-footer d-flex gap-2">
                  {selectionMode ? (
                    <button 
                      className="btn btn-sm btn-success w-100"
                      onClick={() => handleImageSelect(image.id, image.image_url)}
                    >
                      <CheckCircle size={14} className="me-1" />
                      Select
                    </button>
                  ) : (
                    <>
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => handleEditImage(image)}
                      >
                        <Pencil size={14} className="me-1" />
                        Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteImage(image.id)}
                      >
                        <Trash2 size={14} className="me-1" />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal 
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            refreshImages();
          }}
          tags={tags}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editingImage && (
        <EditModal 
          image={editingImage}
          onClose={() => {
            setShowEditModal(false);
            setEditingImage(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingImage(null);
            refreshImages();
          }}
          tags={tags}
        />
      )}
    </div>
  );
};

// Edit Modal Component
const EditModal: React.FC<{
  image: ImageLibraryListItem;
  onClose: () => void;
  onSuccess: () => void;
  tags: { id: number; name: string }[];
}> = ({ image, onClose, onSuccess, tags }) => {
  const [name, setName] = useState(image.name);
  const [description, setDescription] = useState(image.description);
  const [selectedTags, setSelectedTags] = useState<number[]>(image.tags.map(t => t.id));
  const [language, setLanguage] = useState<'en' | 'fr' | ''>(image.language || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      alert('Please provide a name');
      return;
    }

    setIsUpdating(true);
    try {
      await ImageLibraryAPI.update(image.id, {
        name,
        description,
        tag_ids: selectedTags,
        language: language || null,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to update image:', error);
      alert('Failed to update image');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Image</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Show current image */}
              <div className="mb-3 text-center">
                <img 
                  src={image.thumbnail_url} 
                  alt={image.name}
                  className="img-fluid rounded"
                  style={{ maxHeight: '150px' }}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Language</label>
                <select 
                  className="form-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'fr' | '')}
                >
                  <option value="">No Language</option>
                  <option value="en">English</option>
                  <option value="fr">French</option>
                </select>
              </div>

              {tags.length > 0 && (
                <div className="mb-3">
                  <label className="form-label">Tags</label>
                  <div className="d-flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        className={`btn btn-sm ${selectedTags.includes(tag.id) ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setSelectedTags(prev =>
                          prev.includes(tag.id)
                            ? prev.filter(id => id !== tag.id)
                            : [...prev, tag.id]
                        )}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Upload Modal Component
const UploadModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
  tags: { id: number; name: string }[];
}> = ({ onClose, onSuccess, tags }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [language, setLanguage] = useState<'en' | 'fr' | ''>('');
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !name) {
      alert('Please provide a name and select a file');
      return;
    }

    setIsUploading(true);
    try {
      await ImageLibraryAPI.create({
        name,
        description,
        image: file,
        tag_ids: selectedTags,
        language: language || null,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Upload Image</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Image File *</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Language</label>
                <select 
                  className="form-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'fr' | '')}
                >
                  <option value="">No Language</option>
                  <option value="en">English</option>
                  <option value="fr">French</option>
                </select>
              </div>

              {tags.length > 0 && (
                <div className="mb-3">
                  <label className="form-label">Tags</label>
                  <div className="d-flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        className={`btn btn-sm ${selectedTags.includes(tag.id) ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setSelectedTags(prev =>
                          prev.includes(tag.id)
                            ? prev.filter(id => id !== tag.id)
                            : [...prev, tag.id]
                        )}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
