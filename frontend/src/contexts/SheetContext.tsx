import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { InteractiveElementsAPI, SheetsAPI } from '../services/api';
import { InteractiveElement, Sheet, SheetPage } from '../types';
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
  createSheet: (data: { name: string; business_id: string; language: string }) => Promise<Sheet>;
  loadPageElements: (pageId: number) => Promise<void>;
  savePageElements: (pageId: number, elements: InteractiveElement[]) => Promise<void>;
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
    }
  }, [user, loadSheets]);

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
  }, []);

  const setEditMode = useCallback((mode: boolean) => {
    setIsEditMode(mode);
  }, []);

  const createSheet = useCallback(async (data: { name: string; business_id: string; language: string }) => {
    const response = await SheetsAPI.create(data);
    await loadSheets();
    return response.data;
  }, [loadSheets]);

  const loadPageElements = useCallback(async (pageId: number) => {
    setIsLoading(true);
    try {
      const response = await InteractiveElementsAPI.list({ page: pageId });
      // Handle both array and paginated response formats
      const elementList = Array.isArray(response.data) ? response.data : (response.data.results || []);
      setPageElements(elementList);
    } catch (error) {
      console.error('Failed to load page elements:', error);
      setPageElements([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
        loadPageElements,
        savePageElements,
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
