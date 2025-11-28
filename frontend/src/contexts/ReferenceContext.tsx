import React, { createContext, useCallback, useContext, useState } from 'react';
import {
  createReference,
  deleteReference,
  getReference,
  getReferenceHistory,
  getReferences,
  updateReference,
} from '../services/reference';
import {
  ReferenceFormData,
  ReferenceHistory,
  ReferenceValue,
  ReferenceValueList,
} from '../types/reference';
import { useError } from './ErrorContext';
import { useSuccess } from './SuccessContext';

interface ReferenceContextType {
  references: ReferenceValueList[];
  loading: boolean;
  selectedReference: ReferenceValue | null;
  history: ReferenceHistory[];
  fetchReferences: (params?: { type?: string; search?: string }) => Promise<void>;
  fetchReference: (id: number) => Promise<void>;
  fetchHistory: (id: number) => Promise<void>;
  createNewReference: (data: ReferenceFormData) => Promise<ReferenceValue>;
  updateExistingReference: (id: number, data: Partial<ReferenceFormData>) => Promise<void>;
  removeReference: (id: number) => Promise<void>;
  clearSelectedReference: () => void;
}

const ReferenceContext = createContext<ReferenceContextType | undefined>(undefined);

export const ReferenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [references, setReferences] = useState<ReferenceValueList[]>([]);
  const [selectedReference, setSelectedReference] = useState<ReferenceValue | null>(null);
  const [history, setHistory] = useState<ReferenceHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const { setError } = useError();
  const { setSuccess } = useSuccess();

  const fetchReferences = useCallback(async (params?: { type?: string; search?: string }) => {
    try {
      setLoading(true);
      const data = await getReferences(params);
      setReferences(data);
    } catch (error) {
      setError('Failed to fetch references');
      console.error('Error fetching references:', error);
    } finally {
      setLoading(false);
    }
  }, [setError]);

  const fetchReference = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const data = await getReference(id);
      setSelectedReference(data);
    } catch (error) {
      setError('Failed to fetch reference details');
      console.error('Error fetching reference:', error);
    } finally {
      setLoading(false);
    }
  }, [setError]);

  const fetchHistory = useCallback(async (id: number) => {
    try {
      const data = await getReferenceHistory(id);
      setHistory(data);
    } catch (error) {
      setError('Failed to fetch reference history');
      console.error('Error fetching history:', error);
    }
  }, [setError]);

  const createNewReference = useCallback(async (data: ReferenceFormData): Promise<ReferenceValue> => {
    try {
      setLoading(true);
      const newReference = await createReference(data);
      setSuccess('Reference created successfully');
      await fetchReferences();
      return newReference;
    } catch (error) {
      setError('Failed to create reference');
      console.error('Error creating reference:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setError, setSuccess, fetchReferences]);

  const updateExistingReference = useCallback(async (
    id: number,
    data: Partial<ReferenceFormData>
  ) => {
    try {
      setLoading(true);
      await updateReference(id, data);
      setSuccess('Reference updated successfully');
      await fetchReferences();
      if (selectedReference?.id === id) {
        await fetchReference(id);
      }
    } catch (error) {
      setError('Failed to update reference');
      console.error('Error updating reference:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setError, setSuccess, fetchReferences, fetchReference, selectedReference]);

  const removeReference = useCallback(async (id: number) => {
    try {
      setLoading(true);
      await deleteReference(id);
      setSuccess('Reference deleted successfully');
      await fetchReferences();
      if (selectedReference?.id === id) {
        setSelectedReference(null);
      }
    } catch (error) {
      setError('Failed to delete reference');
      console.error('Error deleting reference:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setError, setSuccess, fetchReferences, selectedReference]);

  const clearSelectedReference = useCallback(() => {
    setSelectedReference(null);
    setHistory([]);
  }, []);

  return (
    <ReferenceContext.Provider
      value={{
        references,
        loading,
        selectedReference,
        history,
        fetchReferences,
        fetchReference,
        fetchHistory,
        createNewReference,
        updateExistingReference,
        removeReference,
        clearSelectedReference,
      }}
    >
      {children}
    </ReferenceContext.Provider>
  );
};

export const useReference = () => {
  const context = useContext(ReferenceContext);
  if (context === undefined) {
    throw new Error('useReference must be used within a ReferenceProvider');
  }
  return context;
};
