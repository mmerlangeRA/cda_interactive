import React, { useEffect, useState } from 'react';
import { AVAILABLE_LANGUAGES, Language, REFERENCE_TYPES, getReferenceModel } from '../../config/references';
import { ImageLibraryAPI } from '../../services/library';
import { ImageLibrary, ImageLibraryListItem } from '../../types/library';
import { ReferenceFormData, ReferenceValue } from '../../types/reference';
import { FieldInput } from './FieldInput';

interface ReferenceFormProps {
  initialData?: ReferenceValue | null;
  onSubmit: (data: ReferenceFormData) => Promise<void>;
  onCancel: () => void;
}

interface FieldValues {
  [fieldName: string]: {
    [language: string]: {
      value: string | number | null;
      imageId: number | null;
      imageData: ImageLibrary | ImageLibraryListItem | null;
    };
  };
}

export const ReferenceForm: React.FC<ReferenceFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [selectedType, setSelectedType] = useState<string>(initialData?.type || '');
  const [activeLanguage, setActiveLanguage] = useState<Language>('en');
  const [fieldValues, setFieldValues] = useState<FieldValues>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load initial data
  useEffect(() => {
    if (initialData && initialData.type) {
      const model = getReferenceModel(initialData.type);
      if (!model) return;

      const values: FieldValues = {};
      
      model.fields.forEach(fieldDef => {
        values[fieldDef.name] = {};
        
        if (fieldDef.needs_translation) {
          // Initialize for each language
          AVAILABLE_LANGUAGES.forEach(lang => {
            const fieldValue = initialData.fields.find(
              f => f.name === fieldDef.name && f.language === lang
            );
            
            values[fieldDef.name][lang] = {
              value: fieldValue?.value_string || fieldValue?.value_int || fieldValue?.value_float || null,
              imageId: fieldValue?.value_image || null,
              imageData: fieldValue?.image || null,
            };
          });
        } else {
          // Non-translatable field
          const fieldValue = initialData.fields.find(
            f => f.name === fieldDef.name && f.language === null
          );
          
          values[fieldDef.name][''] = {
            value: fieldValue?.value_string || fieldValue?.value_int || fieldValue?.value_float || null,
            imageId: fieldValue?.value_image || null,
            imageData: fieldValue?.image || null,
          };
        }
      });
      
      setFieldValues(values);
    }
  }, [initialData]);

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setFieldValues({});
  };

  const handleFieldChange = (
    fieldName: string,
    language: string,
    value: string | number | null,
    imageId?: number | null
  ) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        [language]: {
          value,
          imageId: imageId !== undefined ? imageId : prev[fieldName]?.[language]?.imageId || null,
          imageData: prev[fieldName]?.[language]?.imageData || null,
        },
      },
    }));
  };

  // Fetch image data when needed
  useEffect(() => {
    const fetchImageData = async () => {
      const imageIds = new Set<number>();
      Object.values(fieldValues).forEach(langValues => {
        Object.values(langValues).forEach(fieldValue => {
          if (fieldValue.imageId && !fieldValue.imageData) {
            imageIds.add(fieldValue.imageId);
          }
        });
      });

      if (imageIds.size > 0) {
        try {
          const response = await ImageLibraryAPI.list({});
          const images = response.data;
          const imageMap = new Map(images.map((img) => [img.id, img]));
          
          setFieldValues(prev => {
            const updated: FieldValues = {};
            Object.keys(prev).forEach(fieldName => {
              updated[fieldName] = {};
              Object.keys(prev[fieldName]).forEach(lang => {
                const fieldData = prev[fieldName][lang];
                const imageId = fieldData.imageId;
                if (imageId && imageMap.has(imageId)) {
                  updated[fieldName][lang] = {
                    ...fieldData,
                    imageData: imageMap.get(imageId)!,
                  };
                } else {
                  updated[fieldName][lang] = fieldData;
                }
              });
            });
            return updated;
          });
        } catch (error) {
          console.error('Failed to fetch image data:', error);
        }
      }
    };

    fetchImageData();
  }, [fieldValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType) {
      alert('Please select a reference type');
      return;
    }

    const model = getReferenceModel(selectedType);
    if (!model) return;

    // Build fields_data array
    const fields_data: ReferenceFormData['fields_data'] = [];
    
    model.fields.forEach(fieldDef => {
      if (fieldDef.needs_translation) {
        // Add entry for each language
        AVAILABLE_LANGUAGES.forEach(lang => {
          const fieldValue = fieldValues[fieldDef.name]?.[lang];
          if (fieldValue) {
            const entry: ReferenceFormData['fields_data'][0] = {
              name: fieldDef.name,
              type: fieldDef.type,
              language: lang,
            };

            if (fieldDef.type === 'string') {
              entry.value_string = (fieldValue.value as string) || '';
            } else if (fieldDef.type === 'int') {
              entry.value_int = (fieldValue.value as number) || 0;
            } else if (fieldDef.type === 'float') {
              entry.value_float = (fieldValue.value as number) || 0.0;
            } else if (fieldDef.type === 'image') {
              entry.value_image = fieldValue.imageId || undefined;
            }

            fields_data.push(entry);
          }
        });
      } else {
        // Non-translatable field
        const fieldValue = fieldValues[fieldDef.name]?.[''];
        if (fieldValue) {
          const entry: ReferenceFormData['fields_data'][0] = {
            name: fieldDef.name,
            type: fieldDef.type,
            language: null,
          };

          if (fieldDef.type === 'string') {
            entry.value_string = (fieldValue.value as string) || '';
          } else if (fieldDef.type === 'int') {
            entry.value_int = (fieldValue.value as number) || 0;
          } else if (fieldDef.type === 'float') {
            entry.value_float = (fieldValue.value as number) || 0.0;
          } else if (fieldDef.type === 'image') {
            entry.value_image = fieldValue.imageId || undefined;
          }

          fields_data.push(entry);
        }
      }
    });

    const formData: ReferenceFormData = {
      type: selectedType,
      fields_data,
    };

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const model = selectedType ? getReferenceModel(selectedType) : null;

  return (
    <form onSubmit={handleSubmit}>
      {/* Type Selection */}
      {!initialData && (
        <div className="mb-3">
          <label className="form-label">Reference Type *</label>
          <select
            className="form-select"
            value={selectedType}
            onChange={(e) => handleTypeChange(e.target.value)}
            required
          >
            <option value="">Select a type...</option>
            {REFERENCE_TYPES.map(type => (
              <option key={type.type} value={type.type}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Fields */}
      {model && (
        <>
          {model.fields.map(fieldDef => (
            <div key={fieldDef.name} className="mb-4">
              {fieldDef.needs_translation ? (
                <>
                  {/* Language tabs */}
                  <div className="mb-2">
                    <ul className="nav nav-tabs">
                      {AVAILABLE_LANGUAGES.map(lang => (
                        <li key={lang} className="nav-item">
                          <button
                            type="button"
                            className={`nav-link ${activeLanguage === lang ? 'active' : ''}`}
                            onClick={() => setActiveLanguage(lang)}
                          >
                            {lang.toUpperCase()}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Field input for active language */}
                  <FieldInput
                    name={`${fieldDef.name}_${activeLanguage}`}
                    label={`${fieldDef.label} (${activeLanguage.toUpperCase()})`}
                    type={fieldDef.type}
                    value={fieldValues[fieldDef.name]?.[activeLanguage]?.value || null}
                    imageValue={fieldValues[fieldDef.name]?.[activeLanguage]?.imageData || null}
                    required={fieldDef.required}
                    onChange={(value, imageId) =>
                      handleFieldChange(fieldDef.name, activeLanguage, value, imageId)
                    }
                  />
                </>
              ) : (
                // Non-translatable field
                <FieldInput
                  name={fieldDef.name}
                  label={fieldDef.label}
                  type={fieldDef.type}
                  value={fieldValues[fieldDef.name]?.['']?.value || null}
                  imageValue={fieldValues[fieldDef.name]?.['']?.imageData || null}
                  required={fieldDef.required}
                  onChange={(value, imageId) =>
                    handleFieldChange(fieldDef.name, '', value, imageId)
                  }
                />
              )}
            </div>
          ))}
        </>
      )}

      {/* Actions */}
      <div className="d-flex gap-2 justify-content-end">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting || !selectedType}
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};
