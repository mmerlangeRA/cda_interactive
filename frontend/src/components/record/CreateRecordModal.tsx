import React, { useState } from "react";
import { useError } from "../../contexts/ErrorContext";
import { useSuccess } from "../../contexts/SuccessContext";
import { RecordsAPI } from "../../services/api";
import { Network } from "../../types";
import { Record } from "../../types/index";
import { defaultSrid } from "../../utils/defaultValues";

interface CreateRecordModalProps {
  show: boolean;
  onHide: () => void;
  onRecordCreated: (record: Record) => void;
  selectedNetwork: Network;
}

const CreateRecordModal: React.FC<CreateRecordModalProps> = ({
  show,
  onHide,
  onRecordCreated: onComplete,
  selectedNetwork,
}) => {
  const [name, setName] = useState<string>("");
  const [srid, setSrid] = useState<number>(defaultSrid);
  const [loading, setLoading] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { setError } = useError();
  const { setSuccess } = useSuccess();

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!name.trim()) {
      setValidationError("Please enter a record name");
      return;
    }

    setValidationError(null);

    setLoading(true);
    try {
      const newRecord = await RecordsAPI.create({
        name,
        srid,
        date_time: new Date().toISOString(),
        network_uuid: selectedNetwork.uuid,
        network_slug: selectedNetwork.slug
      });
      if (newRecord.status == 201) {
        setSuccess(`record ${name} created`)
        onComplete(newRecord.data);
      }

      setName("");

      onHide();
    } catch (error) {
      setError("Failed to create record: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  // Reset validation error when modal is closed or reopened
  React.useEffect(() => {
    if (show) {
      setValidationError(null);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Create New Record</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onHide}
                disabled={loading}
              ></button>
            </div>
            <div className="modal-body">
              {/* Record Name Input */}
              <div className="mb-3">
                <label htmlFor="recordName" className="form-label">
                  Record Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="recordName"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (validationError && e.target.value.trim()) {
                      setValidationError(null);
                    }
                  }}
                  placeholder="Enter record name"
                  required
                  autoFocus
                />
              </div>

              {/* SRID Input */}
              <div className="mb-3">
                <label htmlFor="srid" className="form-label">
                  SRID
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="srid"
                  value={srid}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setSrid(value);
                    if (validationError && !isNaN(value)) {
                      setValidationError(null);
                    }
                  }}
                  placeholder="Enter SRID (e.g., 2154)"
                  required
                />
                <div className="form-text">
                  SRID refers to the Spatial Reference System Identifier.
                </div>
              </div>

              {/* Validation Error */}
              {validationError && (
                <div className="text-danger mt-2">{validationError}</div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onHide}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating...
                  </>
                ) : (
                  "Create Record"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRecordModal;
