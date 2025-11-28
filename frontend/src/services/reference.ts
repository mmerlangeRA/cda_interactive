import {
    ReferenceFormData,
    ReferenceHistory,
    ReferenceValue,
    ReferenceValueList,
} from '../types/reference';
import api from './api';

/**
 * Get all references
 */
export const getReferences = async (params?: {
  type?: string;
  search?: string;
}): Promise<ReferenceValueList[]> => {
  const response = await api.get('/references/', { params });
  return response.data;
};

/**
 * Get a single reference by ID
 */
export const getReference = async (id: number): Promise<ReferenceValue> => {
  const response = await api.get(`/references/${id}/`);
  return response.data;
};

/**
 * Create a new reference
 */
export const createReference = async (
  data: ReferenceFormData
): Promise<ReferenceValue> => {
  const response = await api.post('/references/', data);
  return response.data;
};

/**
 * Update an existing reference
 */
export const updateReference = async (
  id: number,
  data: Partial<ReferenceFormData>
): Promise<ReferenceValue> => {
  const response = await api.patch(`/references/${id}/`, data);
  return response.data;
};

/**
 * Delete a reference
 */
export const deleteReference = async (id: number): Promise<void> => {
  await api.delete(`/references/${id}/`);
};

/**
 * Get version history for a reference
 */
export const getReferenceHistory = async (
  id: number
): Promise<ReferenceHistory[]> => {
  const response = await api.get(`/references/${id}/history/`);
  return response.data;
};

/**
 * Get available reference types from the database
 */
export const getReferenceTypes = async (): Promise<string[]> => {
  const response = await api.get('/references/types/');
  return response.data;
};
