import React from "react";
import { Images, ShieldCheck, Upload } from "react-bootstrap-icons";
import Accordion from "react-bootstrap/Accordion";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import { Execution, Record } from "../../types";
import { getExecutionStatus } from "../../utils/executionStatuses";
import RecordDownloadComponent from "./RecordDownloadComponent";
import RecordExecutions from "./RecordExecutions";
import VideoList from "./VideoList";

interface RecordItemProps {
  record: Record;
  onSetMasterVideo: (record: Record, videoId: number) => Promise<void>;
  onStartWorkflow: (record: Record, workflow_name: string) => void;
  onUploadVideo: (record: Record) => void;
  recordDownloadKey: string;
  onSelectErrorExecution?: (execution: Execution) => void;
  isChecked?: boolean;
  onCheckChange?: (recordId: number, checked: boolean) => void;
}

const RecordItem: React.FC<RecordItemProps> = ({
  record,
  onSetMasterVideo,
  onStartWorkflow,
  onUploadVideo,
  recordDownloadKey,
  isChecked = false,
  onCheckChange,
  //onSelectErrorExecution
}) => {


  const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onCheckChange) {
      onCheckChange(record.id, e.target.checked);
    }
  };

  return (
    <Accordion className="mb-3">
      <Card>
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <div className="d-flex align-items-center w-100">
              {/* Checkbox */}
              <Form.Check
                type="checkbox"
                className="me-3"
                checked={isChecked}
                onChange={handleCheckChange}
                onClick={(e) => e.stopPropagation()} // Prevent accordion toggle when clicking checkbox
              />

              {/* Record Info */}
              <div className="flex-grow-1">
                <h6 className="mb-0 d-flex align-items-center">
                  {record.name}
                  <Badge
                    bg={
                      record.type === 'PANORAMA' ? 'success' :
                        record.type === 'PHOTO' ? 'primary' : 'secondary'
                    }
                    className="ms-2"
                  >
                    {record.type}
                  </Badge>
                </h6>
                <div className="record-meta text-muted small">
                  <div>Created: {new Date(record.created_at).toLocaleString()}</div>
                  {record.user_email && <div>Created by: {record.user_email}</div>}
                  <div>srid: {record.srid}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="record-actions">
                <div className="d-flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent accordion toggle
                      onUploadVideo(record);
                    }}
                    disabled={getExecutionStatus(record) != "none"}
                    className="d-flex align-items-center gap-1"
                  >
                    <Upload size={14} />
                    Upload Videos
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    disabled={getExecutionStatus(record, "extract_frames") == "completed" || record.videos.length == 0}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent accordion toggle
                      onStartWorkflow(record, "extract_frames");
                    }}
                    className="d-flex align-items-center gap-1"
                  >
                    <Images size={14} />
                    Extract frames
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    disabled={getExecutionStatus(record, "anonymize_and_360") == "completed" || record.videos.length == 0}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent accordion toggle
                      onStartWorkflow(record, "anonymize_and_360");
                    }}
                    className="d-flex align-items-center gap-1"
                  >
                    <ShieldCheck size={14} />
                    Anonymize/360
                  </Button>
                </div>
              </div>
            </div>
          </Accordion.Header>

          <Accordion.Body>
            {/* Executions */}
            {record.executions.length > 0 && (
              <div className="mb-3">
                <RecordExecutions executions={record.executions || []} />
              </div>
            )}

            {/* Videos */}
            {record.videos.length > 0 && (
              <div className="mb-3">
                <VideoList
                  videos={record.videos}
                  onSetMaster={onSetMasterVideo}
                  record={record}
                />
              </div>
            )}

            {/* Download Components */}
            {record.videos.length > 0 && (
              <div className="mt-4">
                <RecordDownloadComponent
                  recordId={record.id}
                  containerType="raw"
                  name="Raw Files"
                  tooltip="Click to view and download raw files (videos) for this record"
                  key={`download-raw-${record.id}-${recordDownloadKey}`}
                />
                <RecordDownloadComponent
                  recordId={record.id}
                  containerType="extracted"
                  name="Extracted Files"
                  tooltip="Click to view and download extracted files (frames, trajectory, result) for this record"
                  key={`download-extracted-${record.id}-${recordDownloadKey}`}
                />
              </div>
            )}
          </Accordion.Body>
        </Accordion.Item>
      </Card>
    </Accordion>
  );
};

export default RecordItem;
