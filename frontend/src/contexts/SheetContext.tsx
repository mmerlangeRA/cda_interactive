import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { InteractiveElementsAPI, SheetPagesAPI, SheetsAPI } from '../services/api';
import { InteractiveElement, Sheet, SheetFilters, SheetPage } from '../types';
import { useAuth } from './AuthContext';

interface SheetContextType {
  sheets: Sheet[];
  selectedSheet: Sheet | null;
  selectedPage: SheetPage | null;
  isEditMode: boolean;
  isLoading: boolean;
  pageElements: InteractiveElement[];
  loadSheets: () => Promise<void>;
  selectSheet: (sheet: Sheet | null) => void;
  selectPage: (page: SheetPage | null) => void;
  setEditMode: (mode: boolean) => void;
  createSheet: (data: { name: string; business_id: string }) => Promise<Sheet>;
  createPage: () => Promise<SheetPage | null>;
  deletePage: (pageId: number) => Promise<void>;
  refreshPages: () => Promise<void>;
  loadPageElements: (pageId: number) => Promise<void>;
  savePageElements: (pageId: number, elements: InteractiveElement[]) => Promise<void>;
  applyFilters: (filters: SheetFilters) => Promise<void>;
}

const SheetContext = createContext<SheetContextType | undefined>(undefined);

export const SheetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<Sheet | null>(null);
  const [selectedPage, setSelectedPage] = useState<SheetPage | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageElements, setPageElements] = useState<InteractiveElement[]>([]);

  const loadSheets = useCallback(async () => {
    if (!user) {
      console.log('No user, skipping sheet load');
      return;
    }
    
    console.log('Loading sheets for user:', user.username);
    setIsLoading(true);
    try {
      const response = await SheetsAPI.list();
      console.log('Sheets API response:', response.data);
      // Handle both array and paginated response formats
      const sheetList = Array.isArray(response.data) ? response.data : (response.data.results || []);
      console.log('Setting sheets:', sheetList);
      setSheets(sheetList);
    } catch (error) {
      console.error('Failed to load sheets:', error);
      setSheets([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    console.log('SheetContext useEffect - user:', user);
    if (user) {
      loadSheets();
    } else {
      // Clear all data when user logs out
      setSheets([]);
      setSelectedSheet(null);
      setSelectedPage(null);
      setIsEditMode(false);
      setPageElements([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadPageElements = useCallback(async (pageId: number) => {
    setIsLoading(true);
    try {
      const response = await InteractiveElementsAPI.list({ page: pageId });
      // Handle both array and paginated response formats
      const elementList = response.data;
      setPageElements(elementList);
    } catch (error) {
      console.error('Failed to load page elements:', error);
      setPageElements([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectSheet = useCallback((sheet: Sheet | null) => {
    setSelectedSheet(sheet);
    setSelectedPage(null);
    setIsEditMode(false);
    setPageElements([]);
  }, []);

  const selectPage = useCallback((page: SheetPage | null) => {
    setSelectedPage(page);
    setIsEditMode(false);
    if (page) {
      loadPageElements(page.id);
    } else {
      setPageElements([]);
    }
  }, [loadPageElements]);

  const setEditMode = useCallback((mode: boolean) => {
    setIsEditMode(mode);
  }, []);

  const createSheet = useCallback(async (data: { name: string; business_id: string }) => {
    const response = await SheetsAPI.create(data);
    await loadSheets();
    return response.data;
  }, [loadSheets]);

  const applyFilters = useCallback(async (filters: SheetFilters) => {
    if (!user) {
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await SheetsAPI.list(filters);
      const sheetList = Array.isArray(response.data) ? response.data : (response.data.results || []);
      setSheets(sheetList);
    } catch (error) {
      console.error('Failed to apply filters:', error);
      setSheets([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const refreshPages = useCallback(async () => {
    if (!selectedSheet) {
      return;
    }

    try {
      await SheetPagesAPI.list({ sheet: selectedSheet.id });
      // This will trigger a re-render in components using this data
      // The actual pages state is managed locally in PageSelector
    } catch (error) {
      console.error('Failed to refresh pages:', error);
      throw error;
    }
  }, [selectedSheet]);

  const createPage = useCallback(async () => {
    if (!selectedSheet) {
      console.error('No sheet selected');
      return null;
    }

    try {
      // Get all existing pages to determine the next page number
      const response = await SheetPagesAPI.list({ sheet: selectedSheet.id });
      const pageList = response.data;
      
      // Calculate next page number
      const maxPageNumber = pageList.length > 0 
        ? Math.max(...pageList.map(p => p.number)) 
        : 0;
      const nextPageNumber = maxPageNumber + 1;

      // Create default descriptions
      const defaultDescription = {
        en: `Page ${nextPageNumber} - Description`,
        fr: `Page ${nextPageNumber} - Description`
      };

      // Create the page
      const newPageResponse = await SheetPagesAPI.create({
        sheet: selectedSheet.id,
        number: nextPageNumber,
        description: defaultDescription
      });

      // Refresh pages list
      await refreshPages();
      
      // Auto-select the new page
      selectPage(newPageResponse.data);
      
      return newPageResponse.data;
    } catch (error) {
      console.error('Failed to create page:', error);
      throw error;
    }
  }, [selectedSheet, refreshPages, selectPage]);

  const deletePage = useCallback(async (pageId: number) => {
    if (!selectedSheet) {
      console.error('No sheet selected');
      return;
    }

    try {
      // Delete the page with renumbering enabled
      await SheetPagesAPI.delete(pageId, true);
      
      // Refresh pages list
      await refreshPages();
      
      // Clear selection if current page was deleted
      if (selectedPage?.id === pageId) {
        // Try to select the first available page
        const response = await SheetPagesAPI.list({ sheet: selectedSheet.id });
        const pageList = response.data;
        if (pageList.length > 0) {
          selectPage(pageList[0]);
        } else {
          selectPage(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete page:', error);
      throw error;
    }
  }, [selectedSheet]);

  const savePageElements = useCallback(async (pageId: number, elements: InteractiveElement[]) => {
    // This is a simplified save - in a real app you'd need to handle create/update/delete
    // For now, we'll just store locally
    console.log('Saving elements for page', pageId, elements);
    // TODO: Implement actual API calls to save elements
  }, []);

  return (
    <SheetContext.Provider
      value={{
        sheets,
        selectedSheet,
        selectedPage,
        isEditMode,
        isLoading,
        pageElements,
        loadSheets,
        selectSheet,
        selectPage,
        setEditMode,
        createSheet,
        createPage,
        deletePage,
        refreshPages,
        loadPageElements,
        savePageElements,
        applyFilters,
      }}
    >
      {children}
    </SheetContext.Provider>
  );
};

export const useSheet = () => {
  const context = useContext(SheetContext);
  if (context === undefined) {
    throw new Error('useSheet must be used within a SheetProvider');
  }
  return context;
};
