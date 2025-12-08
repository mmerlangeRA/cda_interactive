import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Modal } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useError } from '../../contexts/ErrorContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSheet } from '../../contexts/SheetContext';
import { useSuccess } from '../../contexts/SuccessContext';
import { SheetPagesAPI } from '../../services/api';
import { SheetPage } from '../../types';


export const PageSelector: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { selectedSheet, selectedPage, selectPage, createPage, deletePage } = useSheet();
  const { setError } = useError();
  const { setSuccess } = useSuccess();
  const [pages, setPages] = useState<SheetPage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadPages = async () => {
    if (!selectedSheet) {
      setPages([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await SheetPagesAPI.list({ sheet: selectedSheet.id });
      // Handle both array and paginated response formats
      const pageList = response.data;
      setPages(pageList);
      // Auto-select first page if available
      if (pageList.length > 0 && !selectedPage) {
        selectPage(pageList[0]);
      }
    } catch (error) {
      console.error('Failed to load pages:', error);
      setPages([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSheet]);

  if (!selectedSheet) {
    return null;
  }

  const getPageDescription = (page: SheetPage): string => {
    if (!page.description || typeof page.description !== 'object') {
      return t('pages.noDescription');
    }
    // Get description for current language with fallback
    return page.description[language] || page.description['en'] || page.description['fr'] || t('pages.noDescription');
  };

  const handleAddPage = async () => {
    try {
      setIsLoading(true);
      await createPage();
      setSuccess(t('pages.createSuccess'));
      // Reload pages to show the new page
      await loadPages();
    } catch (error) {
      console.error('Error creating page:', error);
      setError(t('pages.createError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = () => {
    if (selectedPage) {
      const currentDescription = getPageDescription(selectedPage);
      setEditDescription(currentDescription === t('pages.noDescription') ? '' : currentDescription);
      setShowEditModal(true);
    }
  };

  const handleEditSave = async () => {
    if (!selectedPage) return;

    try {
      setIsSaving(true);
      // Merge new description with existing ones
      const updatedDescription = {
        ...selectedPage.description,
        [language]: editDescription,
      };
      
      await SheetPagesAPI.partialUpdate(selectedPage.id, {
        description: updatedDescription,
      });
      
      setSuccess(t('pages.updateSuccess'));
      setShowEditModal(false);
      // Reload pages to show updated description
      await loadPages();
    } catch (error) {
      console.error('Error updating page description:', error);
      setError(t('pages.updateError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    if (selectedPage) {
      setShowDeleteModal(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPage) return;

    try {
      setIsDeleting(true);
      await deletePage(selectedPage.id);
      setSuccess(t('pages.deleteSuccess'));
      setShowDeleteModal(false);
      // Reload pages to show updated list
      await loadPages();
    } catch (error) {
      console.error('Error deleting page:', error);
      setError(t('pages.deleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  const canEditPages = user?.role === 'EDITOR' || user?.role === 'ADMIN';

  return (
    <>
      <Dropdown>
        <Dropdown.Toggle variant="outline-primary" id="page-selector" disabled={isLoading}>
          {isLoading ? (
            t('pages.loadingPages')
          ) : selectedPage ? (
            `${t('pages.page')} ${selectedPage.number}: ${getPageDescription(selectedPage)}`
          ) : (
            t('pages.selectPage')
          )}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {pages.length === 0 ? (
            <Dropdown.ItemText>{t('pages.noPages')}</Dropdown.ItemText>
          ) : (
            pages.map((page) => (
              <Dropdown.Item
                key={page.id}
                active={selectedPage?.id === page.id}
                onClick={() => selectPage(page)}
              >
                {t('pages.page')} {page.number}: {getPageDescription(page)}
              </Dropdown.Item>
            ))
          )}
          {pages.length > 0 && user?.role !== 'READER' && <Dropdown.Divider />}
          {selectedPage && canEditPages && (
            <Dropdown.Item onClick={handleEditClick} disabled={isLoading}>
              ✏️ {t('pages.editDescription')}
            </Dropdown.Item>
          )}
          {user?.role !== 'READER' && (
            <Dropdown.Item onClick={handleAddPage} disabled={isLoading}>
              ➕ {t('pages.addNewPage')}
            </Dropdown.Item>
          )}
          {selectedPage && user?.role !== 'READER' && (
            <Dropdown.Item onClick={handleDeleteClick} disabled={isLoading}>
              🗑️ {t('pages.deleteCurrentPage')}
            </Dropdown.Item>
          )}
        </Dropdown.Menu>
      </Dropdown>

      {/* Edit Description Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('pages.editDescription')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label htmlFor="page-description" className="form-label">
              {t('pages.descriptionFor')} {language.toUpperCase()}
            </label>
            <input
              type="text"
              className="form-control"
              id="page-description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder={t('pages.enterDescription')}
              disabled={isSaving}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={isSaving}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleEditSave} disabled={isSaving}>
            {isSaving ? t('common.loading') : t('common.save')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('pages.confirmDeleteTitle')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPage && 
            t('pages.confirmDeleteMessage').replace('{number}', selectedPage.number.toString())
          }
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm} disabled={isDeleting}>
            {isDeleting ? t('common.loading') : t('common.delete')}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
