import React, { useEffect, useState } from "react";
import { useError } from "../contexts/ErrorContext";
import { useSuccess } from "../contexts/SuccessContext";
import { RecordsAPI } from "../services/api";
import { JsonSchemaProperty, JsonSchemaType, Workflow, WorkflowParams } from "../types";
import { Record } from "../types/index";
interface WorkflowModalProps {
  show: boolean;
  onHide: () => void;
  onComplete: (record: Record) => void;
  record: Record;
  executionId?: number;
  workflow_name?: string;
}

interface FormData {
  [key: string]: string;
}

const WorkflowModal: React.FC<WorkflowModalProps> = ({
  show,
  onHide,
  onComplete,
  record,
  executionId,
  workflow_name
}) => {
  const [formData, setFormData] = useState<FormData>({});
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const { setError } = useError();
  const { setSuccess } = useSuccess();

  const renderFormField = (name: string, schema: JsonSchemaProperty) => {
    const value = formData[name] ?? schema.default?.toString() ?? "";
    const isRequired = selectedWorkflow?.workflow_specific_data?.required?.includes(name);

    if (schema.type === 'boolean') {
      return (
        <div className="mb-3 form-check" key={name}>
          <input
            type="checkbox"
            className="form-check-input"
            id={name}
            checked={value === 'true'}
            onChange={(e) => setFormData({ ...formData, [name]: e.target.checked.toString() })}
            required={isRequired}
          />
          <label className="form-check-label" htmlFor={name}>
            {name}
            {isRequired && <span className="text-danger">*</span>}
          </label>
          {schema.description && (
            <div className="form-text text-muted">
              {schema.description}
            </div>
          )}
        </div>
      );
    }

    const getInputType = (type: JsonSchemaType) => {
      switch (type) {
        case 'integer':
        case 'number':
          return 'number';
        default:
          return 'text';
      }
    };

    const getStep = (type: JsonSchemaType) => {
      switch (type) {
        case 'integer':
          return '1';
        case 'number':
          return 'any';
        default:
          return undefined;
      }
    };

    return (
      <div className="mb-3" key={name}>
        <label htmlFor={name} className="form-label">
          {name}
          {isRequired && <span className="text-danger">*</span>}
        </label>
        <input
          type={getInputType(schema.type)}
          className="form-control"
          id={name}
          value={value}
          onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
          min={schema.minimum}
          max={schema.maximum}
          step={getStep(schema.type)}
          required={isRequired}
          placeholder={schema.description || ""}
        />
        {schema.description && (
          <div className="form-text text-muted">
            {schema.description}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (show) {
      fetchWorkflows();
    }
  }, [show, record]);

  useEffect(() => {
    // Initialize form data when workflow is selected
    if (selectedWorkflow?.workflow_specific_data?.properties) {
      const initialData: FormData = {};
      Object.entries(selectedWorkflow.workflow_specific_data.properties).forEach(([key, prop]) => {
        if (prop.default !== undefined) {
          initialData[key] = prop.default.toString();
        } else if (prop.type === 'boolean') {
          initialData[key] = 'false';
        } else if (prop.type === 'number' || prop.type === 'integer') {
          initialData[key] = prop.minimum?.toString() ?? '0';
        } else {
          initialData[key] = '';
        }
      });
      setFormData(initialData);
    }
  }, [selectedWorkflow]);

  const fetchWorkflows = async () => {
    try {
      const response = await RecordsAPI.listActiveWorkflows();
      if (workflow_name != "") {
        const found = response.data.find(d => d.name == workflow_name)
        if (found) { setSelectedWorkflow(found) }
        else {
          setError(`Failed to fetch available workflow ${workflow_name}`)
        }

      }
      setWorkflows(response.data);
      if (response.data.length > 0) {
        setSelectedWorkflow(response.data[0]);
      }
      setLoading(false);
    } catch (error) {
      setError(`Failed to fetch available workflows ${error}`);
      setLoading(false);
    }
  };

  const validateFormData = (): boolean => {
    if (!selectedWorkflow?.workflow_specific_data) return true;

    const { properties, required = [] } = selectedWorkflow.workflow_specific_data;

    for (const [key, prop] of Object.entries(properties)) {
      const value = formData[key];

      // Check required fields
      if (required.includes(key) && (value === undefined || value === '')) {
        alert(`${key} is required`);
        return false;
      }

      // Skip validation if field is empty and not required
      if (!value && !required.includes(key)) {
        continue;
      }

      // Type-specific validation
      switch (prop.type) {
        case 'number':
        case 'integer': {
          const numValue = prop.type === 'integer' ? parseInt(value) : parseFloat(value);
          if (isNaN(numValue)) {
            alert(`${key} must be a valid ${prop.type}`);
            return false;
          }
          if (prop.minimum !== undefined && numValue < prop.minimum) {
            alert(`${key} must be greater than or equal to ${prop.minimum}`);
            return false;
          }
          if (prop.maximum !== undefined && numValue > prop.maximum) {
            alert(`${key} must be less than or equal to ${prop.maximum}`);
            return false;
          }
          break;
        }
        case 'boolean': {
          if (value !== 'true' && value !== 'false') {
            alert(`${key} must be a boolean value`);
            return false;
          }
          break;
        }
        // Add string validation if needed
        case 'string': {
          // Could add string-specific validation here if needed
          break;
        }
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!selectedWorkflow) {
      alert("Please select a workflow");
      return;
    }

    if (!validateFormData()) {
      return;
    }

    // Convert form data to appropriate types
    const params: WorkflowParams = {
      webhook_url: selectedWorkflow.webhook_url,
      workflow_name: workflow_name,
      execution_id: executionId
    };


    // Add custom form data with proper type conversion
    if (selectedWorkflow.workflow_specific_data?.properties) {
      Object.entries(selectedWorkflow.workflow_specific_data.properties).forEach(([key, prop]) => {
        const value = formData[key];
        if (value !== undefined && value !== '') {
          switch (prop.type) {
            case 'integer':
              params[key] = parseInt(value);
              break;
            case 'number':
              params[key] = parseFloat(value);
              break;
            case 'boolean':
              params[key] = value === 'true';
              break;
            default:
              params[key] = value;
          }
        } else if (prop.default !== undefined) {
          params[key] = prop.default;
        }
      });
    }

    try {
      //we hide right away : simple trick to avoid multiple calls on start
      onHide();
      const startResponse = await RecordsAPI.startWorkflow(record.id, params);
      //check status
      if (startResponse.status != 200) {
        //raise exception
        const errorMessage = startResponse.data.error as string | "unknown server error"
        throw Error(errorMessage)
      }
      setSuccess(`Workflow ${executionId ? "resumed" : "started"} successfully`);

      // Wait a short moment for the execution to be created before refreshing
      /*       setTimeout(() => {
              onComplete();
            }, 1000); */
      onComplete(record);
    } catch (error) {
      setError(`Failed to ${executionId ? "resume" : "start"} workflow:` + JSON.stringify(error));
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {executionId ? "Resume Workflow" : "Start Workflow"} : {workflow_name}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onHide}
            ></button>
          </div>
          <div className="modal-body">
            {loading ? (
              <div className="text-center">Loading workflows...</div>
            ) : workflows.length === 0 ? (
              <div className="alert alert-warning">No workflows available</div>
            ) : (
              <>
                {workflow_name ? (<></>) :
                  (<div className="mb-3">
                    <label htmlFor="workflow" className="form-label">
                      Select Workflow
                    </label>
                    <select
                      className="form-select"
                      id="workflow"
                      value={selectedWorkflow?.id || ""}
                      onChange={(e) => {
                        const workflowId = Number(e.target.value);
                        const workflow = workflows.find(w => w.id === workflowId);
                        setSelectedWorkflow(workflow || null);
                      }}
                      required
                    >
                      <option value="">Select a workflow</option>
                      {workflows.map((workflow) => (
                        <option key={workflow.id} value={workflow.id}>
                          {workflow.name}
                        </option>
                      ))}
                    </select>
                  </div>)}


                {selectedWorkflow?.workflow_specific_data?.properties &&
                  Object.entries(selectedWorkflow.workflow_specific_data.properties).map(([name, schema]) =>
                    renderFormField(name, schema)
                  )
                }
              </>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onHide}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading || !selectedWorkflow}
            >
              {executionId ? "Resume Workflow" : "Start Workflow"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowModal;
