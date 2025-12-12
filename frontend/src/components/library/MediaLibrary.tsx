import React, { useState } from 'react';
import { CheckCircle, Pencil, PlayCircleFill, Plus, Search, Trash2 } from 'react-bootstrap-icons';
import { useLibrary } from '../../contexts/LibraryContext';
import { MediaLibraryAPI } from '../../services/library';
import { MediaLibraryListItem, MediaType } from '../../types/library';

interface MediaLibraryProps {
  onMediaSelect?: (mediaId: number, mediaUrl: string) => void;
  selectionMode?: boolean;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({ 
  onMediaSelect,
  selectionMode = false 
}) => {
  const { media, tags, setFilters, refreshMedia, isLoading } = useLibrary();
  const [searchText, setSearchText] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaLibraryListItem | null>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'en' | 'fr' | 'null'>('all');
  const [selectedMediaType, setSelectedMediaType] = useState<'all' | 'image' | 'video'>('all');

  const handleSearch = () => {
    setFilters({
      search: searchText || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      language: selectedLanguage === 'all' ? undefined : selectedLanguage,
      media_type: selectedMediaType === 'all' ? undefined : selectedMediaType as MediaType,
    });
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleEditMedia = (item: MediaLibraryListItem) => {
    setEditingMedia(item);
    setShowEditModal(true);
  };

  const handleDeleteMedia = async (mediaId: number) => {
    if (!confirm('Are you sure you want to delete this media?')) {
      return;
    }

    try {
      await MediaLibraryAPI.delete(mediaId);
      await refreshMedia();
    } catch (error) {
      console.error('Failed to delete media:', error);
      alert('Failed to delete media');
    }
  };

  const handleMediaSelect = (mediaId: number, mediaUrl: string) => {
    if (onMediaSelect) {
      onMediaSelect(mediaId, mediaUrl);
    }
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      {/* Search and Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search media..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button className="btn btn-outline-secondary" onClick={handleSearch}>
                  <Search size={18} />
                </button>
              </div>
            </div>

            <div className="col-md-2">
              <select 
                className="form-select"
                value={selectedMediaType}
                onChange={(e) => setSelectedMediaType(e.target.value as 'all' | 'image' | 'video')}
              >
                <option value="all">All Media</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
              </select>
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
                    {tag.name} ({tag.media_count})
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
            Upload Media
          </button>
        </div>
      )}

      {/* Media Grid */}
      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p>No media found. Upload your first image or video to get started!</p>
        </div>
      ) : (
        <div className="row g-3">
          {media.map(item => (
            <div key={item.id} className="col-md-3">
              <div className="card h-100">
                <div className="position-relative">
                  <img 
                    src={item.thumbnail_url} 
                    alt={item.name}
                    className="card-img-top"
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  {item.media_type === 'video' && (
                    <>
                      <div className="position-absolute top-50 start-50 translate-middle">
                        <PlayCircleFill size={48} className="text-white" style={{ opacity: 0.8 }} />
                      </div>
                      {item.duration && (
                        <span className="position-absolute bottom-0 end-0 badge bg-dark m-2">
                          {formatDuration(item.duration)}
                        </span>
                      )}
                    </>
                  )}
                </div>
                <div className="card-body">
                  <h6 className="card-title">{item.name}</h6>
                  {item.description && (
                    <p className="card-text small text-muted">{item.description}</p>
                  )}
                  <div className="d-flex flex-wrap gap-1 mb-2">
                    <span className={`badge ${item.media_type === 'video' ? 'bg-success' : 'bg-primary'}`}>
                      {item.media_type.toUpperCase()}
                    </span>
                    {item.tags.map(tag => (
                      <span key={tag.id} className="badge bg-secondary">{tag.name}</span>
                    ))}
                  </div>
                  {item.language && (
                    <span className="badge bg-info">{item.language.toUpperCase()}</span>
                  )}
                </div>
                <div className="card-footer d-flex gap-2">
                  {selectionMode ? (
                    <button 
                      className="btn btn-sm btn-success w-100"
                      onClick={() => handleMediaSelect(item.id, item.file_url)}
                    >
                      <CheckCircle size={14} className="me-1" />
                      Select
                    </button>
                  ) : (
                    <>
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => handleEditMedia(item)}
                      >
                        <Pencil size={14} className="me-1" />
                        Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteMedia(item.id)}
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
            refreshMedia();
          }}
          tags={tags}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editingMedia && (
        <EditModal 
          media={editingMedia}
          onClose={() => {
            setShowEditModal(false);
            setEditingMedia(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingMedia(null);
            refreshMedia();
          }}
          tags={tags}
        />
      )}
    </div>
  );
};

// Edit Modal Component
const EditModal: React.FC<{
  media: MediaLibraryListItem;
  onClose: () => void;
  onSuccess: () => void;
  tags: { id: number; name: string }[];
}> = ({ media, onClose, onSuccess, tags }) => {
  const [name, setName] = useState(media.name);
  const [description, setDescription] = useState(media.description);
  const [selectedTags, setSelectedTags] = useState<number[]>(media.tags.map(t => t.id));
  const [language, setLanguage] = useState<'en' | 'fr' | ''>(media.language || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      alert('Please provide a name');
      return;
    }

    setIsUpdating(true);
    try {
      await MediaLibraryAPI.update(media.id, {
        name,
        description,
        tag_ids: selectedTags,
        language: language || null,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to update media:', error);
      alert('Failed to update media');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit {media.media_type === 'video' ? 'Video' : 'Image'}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Show current media */}
              <div className="mb-3 text-center">
                {media.media_type === 'video' ? (
                  <video 
                    src={media.file_url}
                    controls
                    className="img-fluid rounded"
                    style={{ maxHeight: '150px' }}
                  />
                ) : (
                  <img 
                    src={media.thumbnail_url} 
                    alt={media.name}
                    className="img-fluid rounded"
                    style={{ maxHeight: '150px' }}
                  />
                )}
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
  const [mediaType, setMediaType] = useState<MediaType>('image');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [language, setLanguage] = useState<'en' | 'fr' | ''>('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    
    // Auto-detect media type from file
    if (selectedFile) {
      if (selectedFile.type.startsWith('video/')) {
        setMediaType('video');
      } else if (selectedFile.type.startsWith('image/')) {
        setMediaType('image');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !name) {
      alert('Please provide a name and select a file');
      return;
    }

    setIsUploading(true);
    try {
      await MediaLibraryAPI.create({
        name,
        description,
        file: file,
        media_type: mediaType,
        tag_ids: selectedTags,
        language: language || null,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to upload media:', error);
      alert('Failed to upload media');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Upload Media</h5>
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
                <label className="form-label">Media Type *</label>
                <div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      id="mediaTypeImage"
                      value="image"
                      checked={mediaType === 'image'}
                      onChange={(e) => setMediaType(e.target.value as MediaType)}
                    />
                    <label className="form-check-label" htmlFor="mediaTypeImage">
                      Image
                    </label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      id="mediaTypeVideo"
                      value="video"
                      checked={mediaType === 'video'}
                      onChange={(e) => setMediaType(e.target.value as MediaType)}
                    />
                    <label className="form-check-label" htmlFor="mediaTypeVideo">
                      Video
                    </label>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Media File *</label>
                <input
                  type="file"
                  className="form-control"
                  accept={mediaType === 'video' ? 'video/*' : 'image/*'}
                  onChange={handleFileChange}
                  required
                />
                <div className="form-text">
                  {mediaType === 'video' ? 'Supported formats: MP4, WebM, etc.' : 'Supported formats: JPG, PNG, GIF, etc.'}
                </div>
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
