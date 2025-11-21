import { useEffect, useRef, useState } from "react";
import { Spinner } from "react-bootstrap";
import { CheckAll, Grid3x3GapFill, PlusCircleFill, XLg } from "react-bootstrap-icons";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import { useError } from "../../contexts/ErrorContext";
import { useSuccess } from "../../contexts/SuccessContext";
import { VideosAPI } from "../../services/api";
import { Network, Record } from "../../types";
import { BatchUploadModalV2 } from "../batch/BatchUploadModalV2";
import UploadModal from "../UploadModal";
import WorkflowModal from "../WorkflowModal";
import CreateRecordModal from "./CreateRecordModal";
import DownloadForSelectedRecords from "./DownloadForSelectedRecords";
import RecordItem from "./RecordItem";

interface RecordListProps {
  loadingRecords: boolean;
  selectedNetwork: Network;
  records: Record[];
  onRecordUpdated: (record: Record | null) => void;
}

const RecordList: React.FC<RecordListProps> = ({
  loadingRecords,
  selectedNetwork,
  records,
  onRecordUpdated,
}) => {
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  // Initialize with all records checked by default
  const [checkedRecords, setCheckedRecords] = useState<Set<number>>(
    new Set(records.map(record => record.id))
  );

  // Update checked records when records change
  useEffect(() => {
    setCheckedRecords(new Set(records.map(record => record.id)));
  }, [records]);

  const { setError } = useError();
  const { setSuccess } = useSuccess();
  const recordDownloadRefs = useRef<{ [recordId: number]: boolean }>({});

  const handleSetMasterVideo = async (record: Record, videoId: number) => {
    try {
      await VideosAPI.setMaster(videoId);
      onRecordUpdated(record);
      // Mark the record's download component as needing refresh
      if (selectedRecord) {
        recordDownloadRefs.current[selectedRecord.id] = true;
      }
    } catch (error) {
      setError(`Failed to set master video  ${error}`);
    }
  };

  const handleUploadComplete = (result?: { success: boolean; message: string }) => {
    if (result) {
      // Show success or error message
      if (result.success) {
        setSuccess(result.message);
        onRecordUpdated(selectedRecord);

      } else {
        setError(result.message);
      }
    } else {
      // Backward compatibility for old behavior
      setShowUploadModal(false);
      onRecordUpdated(selectedRecord);
    }
  };

  const handleBatchUploadComplete = (result?: { success: boolean; message: string }) => {
    setShowBatchModal(false);

    if (result) {
      if (result.success) {
        setSuccess(result.message);
        onRecordUpdated(null);
      } else {
        setError(result.message);
      }
    } else {
      onRecordUpdated(null);
    }
  };

  const handleWorkflowStarted = (record: Record) => {
    setShowWorkflowModal(false);
    onRecordUpdated(record);
  };

  const handleCreateComplete = (record: Record) => {
    setShowCreateModal(false);
    onRecordUpdated(record);
  };

  const handleStartWorkflow = (record: Record, workflow_name: string) => {
    setSelectedRecord(record);
    setShowWorkflowModal(true);
    setSelectedWorkflow(workflow_name);
  };

  const handleUploadVideo = (record: Record) => {
    setSelectedRecord(record);
    setShowUploadModal(true);
  };

  const handleCheckChange = (recordId: number, checked: boolean) => {
    setCheckedRecords(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(recordId);
      } else {
        newSet.delete(recordId);
      }
      return newSet;
    });
  };

  const getCheckedRecords = (): Record[] => {
    return records.filter(record => checkedRecords.has(record.id));
  };

  return (
    <Container className="records-container p-0">
      <div className="d-flex mb-3 gap-2 flex-wrap">
        <div className="d-flex me-auto">
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="d-flex align-items-center gap-2 me-2"
          >
            <PlusCircleFill size={16} />
            Create Record
          </Button>
          <Button
            variant="success"
            onClick={() => setShowBatchModal(true)}
            className="d-flex align-items-center gap-2"
          >
            <Grid3x3GapFill size={16} />
            Batch
          </Button>
        </div>

        {records.length > 0 && (
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => {
                const allIds = new Set(records.map(record => record.id));
                setCheckedRecords(allIds);
              }}
              className="d-flex align-items-center justify-content-center"
              style={{ width: '30px', height: '30px', padding: '0' }}
              title="Check All"
            >
              <CheckAll size={16} />
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setCheckedRecords(new Set())}
              className="d-flex align-items-center justify-content-center"
              style={{ width: '30px', height: '30px', padding: '0' }}
              title="Uncheck All"
            >
              <XLg size={16} />
            </Button>
          </div>
        )}
      </div>
      {loadingRecords ? (
        <Spinner animation="border" size="sm" />
      ) : (<>
        {/* Download buttons for all selected records */}
        {getCheckedRecords().length > 0 && (
          <DownloadForSelectedRecords records={getCheckedRecords()} />
        )}

        {records.map((record) => (
          <RecordItem
            key={record.id}
            record={record}
            onSetMasterVideo={handleSetMasterVideo}
            onStartWorkflow={handleStartWorkflow}
            onUploadVideo={handleUploadVideo}
            recordDownloadKey={recordDownloadRefs.current[record.id] ? 'refreshed' : 'initial'}
            isChecked={checkedRecords.has(record.id)}
            onCheckChange={handleCheckChange}
          />
        ))}

      </>)}




      {/* Modals */}
      <CreateRecordModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onRecordCreated={handleCreateComplete}
        selectedNetwork={selectedNetwork}
      />

      {showBatchModal && <BatchUploadModalV2
        onHide={() => setShowBatchModal(false)}
        onComplete={handleBatchUploadComplete}
        selectedNetwork={selectedNetwork}
      />}

      {selectedRecord && (
        <>
          <UploadModal
            show={showUploadModal}
            onHide={() => setShowUploadModal(false)}
            onComplete={handleUploadComplete}
            recordId={selectedRecord.id}
            recordType={selectedRecord.type}
          />
          <WorkflowModal
            show={showWorkflowModal}
            onHide={() => setShowWorkflowModal(false)}
            onComplete={handleWorkflowStarted}
            record={selectedRecord}
            workflow_name={selectedWorkflow}
          />
        </>
      )}
    </Container>
  );
};

export default RecordList;
