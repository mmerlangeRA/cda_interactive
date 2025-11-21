import React, { useState } from "react";
import { InfoCircleFill } from "react-bootstrap-icons";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import ProgressBar from "react-bootstrap/ProgressBar";
import Spinner from "react-bootstrap/Spinner";
import { Network, PhotoCollection, Record } from "../../types";
import { RecordsExecutionsSummary, summarizeExecutions } from "../../utils/executionStatuses";
import NetworkDetailsModal from "./NetworkDetailsModal";

interface NetworkSummaryProps {
  network: Network;
  records: Record[];
  photoCollections: PhotoCollection[];
  loadingCollections: boolean;
}

const NetworkSummary: React.FC<NetworkSummaryProps> = ({
  network,
  records,
  photoCollections,
  loadingCollections,
}) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Summarize executions
  const executionSummaries = summarizeExecutions(records);
  // Count records by type
  const recordsByType = records.reduce((acc, record) => {
    acc[record.type] = (acc[record.type] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  // Count videos by type
  const videosByType = records.reduce((acc, record) => {
    record.videos.forEach(video => {
      acc[video.type] = (acc[video.type] || 0) + 1;
    });
    return acc;
  }, {} as { [key: string]: number });

  const totalVideos = records.reduce((total, record) => total + record.videos.length, 0);

  // Get unique collection types
  const uniqueCollectionTypes = Array.from(new Set(photoCollections.map(c => c.type)));

  return (
    <>
      <Card className="mb-3">
        <Card.Body className="d-flex flex-wrap align-items-center">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center">
              <h5 className="mb-0 me-2">{network.name}</h5>
              <Button
                variant="outline-primary"
                size="sm"
                className="p-1 d-flex align-items-center justify-content-center"
                style={{ width: '30px', height: '30px' }}
                title="View Network Details"
                onClick={() => setShowDetailsModal(true)}
              >
                <InfoCircleFill size={16} />
              </Button>
            </div>
            <div className="text-muted small">{network.name_long}</div>

            {/* Photo Collections as badges */}
            {loadingCollections ? (
              <div className="mt-1">
                <Spinner animation="border" size="sm" />
                <span className="ms-1 small">Loading collections...</span>
              </div>
            ) : photoCollections.length > 0 ? (
              <div className="mt-1 d-flex flex-wrap gap-1">
                Collections: {uniqueCollectionTypes.map(type => (
                  <Badge
                    key={type}
                    bg={type === 'PHOTO' ? 'primary' : 'success'}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
          {/* Combined Stats and Executions */}
          <div className="d-flex align-items-stretch ms-auto"> {/* Use ms-auto to push to the right, align-items-stretch */}
            {/* Records Stat Card */}
            <Card className="stat-box me-2 text-center">
              <Card.Body className="p-2 d-flex flex-column justify-content-center"> {/* Center content vertically */}
                <div className="stat-value">{records.length}</div>
                <div className="stat-label small">Records</div>
                <div className="d-flex justify-content-center gap-1 mt-1">
                  {Object.entries(recordsByType).map(([type, count]) => (
                    <span
                      key={type}
                      className="badge-sm"
                      title={`${type}: ${count}`}
                    >
                      <Badge
                        bg={
                          type === 'PANORAMA' ? 'success' :
                            type === 'PHOTO' ? 'primary' : 'secondary'
                        }
                      >
                        {count}
                      </Badge>
                    </span>
                  ))}
                </div>
              </Card.Body>
            </Card>
            {/* Videos Stat Card */}
            <Card className="stat-box me-2 text-center"> {/* Added me-2 */}
              <Card.Body className="p-2 d-flex flex-column justify-content-center"> {/* Center content vertically */}
                <div className="stat-value">{totalVideos}</div>
                <div className="stat-label small">Videos</div>
                <div className="d-flex justify-content-center gap-1 mt-1">
                  {Object.entries(videosByType).map(([type, count]) => (
                    <span
                      key={type}
                      className="badge-sm"
                      title={`${type}: ${count}`}
                    >
                      <Badge
                        bg={type === 'PANORAMA' ? 'success' : 'primary'}
                      >
                        {count}
                      </Badge>
                    </span>
                  ))}
                </div>
              </Card.Body>
            </Card>
            {/* Execution Summaries Card - Now a direct sibling */}
            {executionSummaries.length > 0 && (
              <Card className="stat-box me-2 text-center">
                <Card.Body className="p-2 d-flex flex-column justify-content-center">
                  <h6 className="mb-1 small text-muted text-center">Execution Statuses</h6>
                  {executionSummaries.map((summary: RecordsExecutionsSummary) => (
                    <div key={summary.executionName} className="mb-1">
                      <div className="d-flex justify-content-between align-items-center mb-0">
                        <span className="fw-bold small text-truncate" title={summary.executionName}>{summary.executionName}</span>
                        <span className="text-muted small flex-shrink-0 ms-1" title={`${summary.nbRecordsCompleted} Completed / ${summary.nbRecordsInError} Error / ${summary.nbRecordsRunning} / ${records.length} Total`}>
                          {summary.nbRecordsCompleted}/{summary.nbRecordsInError}/{summary.nbRecordsRunning}/{records.length}
                        </span>
                      </div>
                      <ProgressBar style={{ height: '8px' }}>
                        <ProgressBar
                          variant="success"
                          style={{ fontSize: '0.6rem' }} // Smaller font for label if needed
                          now={(summary.nbRecordsCompleted / records.length) * 100}
                          key={1}
                          title={`Completed: ${summary.nbRecordsCompleted} (${((summary.nbRecordsCompleted / records.length) * 100).toFixed(0)}%)`}
                          label={summary.nbRecordsCompleted > 0 ? `${((summary.nbRecordsCompleted / records.length) * 100).toFixed(0)}%` : ""}
                        />
                        <ProgressBar
                          variant="danger"
                          style={{ fontSize: '0.6rem' }}
                          now={(summary.nbRecordsInError / records.length) * 100}
                          key={2}
                          title={`Error: ${summary.nbRecordsInError} (${((summary.nbRecordsInError / records.length) * 100).toFixed(0)}%)`}
                          label={summary.nbRecordsInError > 0 ? `${((summary.nbRecordsInError / records.length) * 100).toFixed(0)}%` : ""}
                        />
                        <ProgressBar
                          variant="info"
                          style={{ fontSize: '0.6rem' }}
                          now={(summary.nbRecordsRunning / records.length) * 100}
                          key={3}
                          title={`Running: ${summary.nbRecordsRunning} (${((summary.nbRecordsRunning / records.length) * 100).toFixed(0)}%)`}
                          label={summary.nbRecordsRunning > 0 ? `${((summary.nbRecordsRunning / records.length) * 100).toFixed(0)}%` : ""}
                        />
                      </ProgressBar>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            )}
            {/* End of d-flex container for stats/executions */}
          </div>
        </Card.Body>
      </Card>

      <NetworkDetailsModal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        network={network}
        photoCollections={photoCollections}
        loadingCollections={loadingCollections}
      />
    </>
  );
};

export default NetworkSummary;
