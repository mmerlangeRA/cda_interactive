import React, { useEffect, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useSheet } from '../../contexts/SheetContext';
import { SheetPagesAPI } from '../../services/api';
import { SheetPage } from '../../types';

export const PageSelector: React.FC = () => {
  const { selectedSheet, selectedPage, selectPage } = useSheet();
  const [pages, setPages] = useState<SheetPage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadPages = async () => {
      if (!selectedSheet) {
        setPages([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await SheetPagesAPI.list({ sheet: selectedSheet.id });
        // Handle both array and paginated response formats
        const pageList = Array.isArray(response.data) ? response.data : (response.data.results || []);
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

    loadPages();
  }, [selectedSheet]);

  if (!selectedSheet) {
    return null;
  }

  return (
    <Dropdown>
      <Dropdown.Toggle variant="outline-primary" id="page-selector">
        {isLoading ? (
          'Loading pages...'
        ) : selectedPage ? (
          `Page ${selectedPage.number}: ${selectedPage.description || 'No description'}`
        ) : (
          'Select a page'
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {pages.length === 0 ? (
          <Dropdown.ItemText>No pages available</Dropdown.ItemText>
        ) : (
          pages.map((page) => (
            <Dropdown.Item
              key={page.id}
              active={selectedPage?.id === page.id}
              onClick={() => selectPage(page)}
            >
              Page {page.number}: {page.description || 'No description'}
            </Dropdown.Item>
          ))
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};
