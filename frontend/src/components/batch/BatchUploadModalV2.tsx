
import React, { useEffect } from "react";
import { Network, VideoTypeEnum } from "../../types/index";
import { FileSelector } from "./FileSelector";
import { RecordList } from "./RecordList";
import { useBatchUpload } from "./useBatchUpload";

// Define the UploadItem interface to match the one in useBatchUpload.ts
interface UploadItem {
    file: File;
    recordId: number;
    status: "pending" | "uploading" | "completed" | "error";
    progress: number;
    error?: string;
    useChunkedUpload?: boolean;
    type: VideoTypeEnum;
    chunks?: {
        index: number;
        progress: number;
        status: "pending" | "uploading" | "completed" | "error";
    }[];
}

interface BatchUploadModalV2Props {
    onHide: () => void;
    onComplete: (result?: { success: boolean; message: string }) => void;
    selectedNetwork: Network;
    timeWindowMinutes?: number; // Optional time window in minutes, defaults to 5
}

export const BatchUploadModalV2: React.FC<BatchUploadModalV2Props> = ({
    onHide,
    onComplete,
    selectedNetwork,
    timeWindowMinutes = 5 // Default to 5 minutes
}) => {
    // State for time window input
    const [timeWindow, setTimeWindow] = React.useState(timeWindowMinutes);
    const {
        setStep,
        batchName,
        batchSrid,
        setBatchName,
        setBatchSrid,
        selectedFiles,
        recordGroups,
        step,
        handleFileSelect,
        removeFile,
        clearFiles,
        groupVideos,
        resetState,
        createRecordsAndUpload,
        uploadQueue: rawUploadQueue,
        error,
        isCreatingRecords,
        isUploading
    } = useBatchUpload(
        selectedNetwork,
        onHide,
        onComplete,
        timeWindow * 60 * 1000 // Convert minutes to milliseconds
    );

    // Cast the uploadQueue to the correct type
    const uploadQueue = rawUploadQueue as unknown as UploadItem[];

    // Reset state when modal is shown or hidden
    useEffect(() => {
        resetState();
    }, []);

    const renderStepContent = () => {
        switch (step) {
            case "select":
                return (
                    <>
                        <div className="mb-3">
                            <label htmlFor="batchName" className="form-label">
                                Batch Name
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="batchName"
                                value={batchName}
                                onChange={(e) => setBatchName(e.target.value)}
                                placeholder="Enter batch name"
                                required
                            />
                            <div className="form-text">
                                This name will be used as a prefix for all created records.
                            </div>
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
                                value={batchSrid}
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    setBatchSrid(value);
                                }}
                                placeholder="Enter SRID (e.g., 2154)"
                                required
                            />
                            <div className="form-text">
                                SRID refers to the Spatial Reference System Identifier.
                            </div>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="timeWindow" className="form-label">
                                Time Window (minutes)
                            </label>
                            <input
                                type="number"
                                className="form-control"
                                id="timeWindow"
                                value={timeWindow}
                                onChange={(e) => setTimeWindow(Math.max(1, parseInt(e.target.value) || 1))}
                                min="1"
                                max="60"
                                required
                            />
                            <div className="form-text">
                                Videos taken within this time window will be grouped into the same record. Default: 5 minutes.
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Select Videos</label>
                            <FileSelector onFilesSelected={handleFileSelect} />
                            <small className="text-muted d-block mt-1">
                                Large files (&gt;50Mo) will be automatically uploaded in chunks for better reliability
                            </small>
                            <small className="text-muted d-block mt-1">
                                Note: Files with .360 extension will be treated as PANORAMA type, all others as PHOTO type.
                            </small>
                        </div>

                        {selectedFiles.length > 0 && (
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <p className="mb-0">Selected {selectedFiles.length} files:</p>
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={clearFiles}
                                        title="Clear all files"
                                    >
                                        Clear All
                                    </button>
                                </div>
                                <ul className="list-group">
                                    {selectedFiles.slice(0, 5).map((file: { file: File; type: VideoTypeEnum }, index: number) => (
                                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                            <div className="text-truncate" style={{ maxWidth: '70%' }}>
                                                {file.file.name}
                                            </div>
                                            <div>
                                                <span className={`badge me-2 ${file.type === VideoTypeEnum.PANORAMA ? 'bg-success' : 'bg-primary'}`}>
                                                    {file.type}
                                                </span>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => removeFile(index)}
                                                    title="Remove file"
                                                >
                                                    <i className="bi bi-x"></i>
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                    {selectedFiles.length > 5 && (
                                        <li className="list-group-item text-center">
                                            ...and {selectedFiles.length - 5} more
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </>
                );
            case "review":
                return <RecordList records={recordGroups} />;
            case "upload":
                return (
                    <div className="upload-queue">
                        <p>Uploading videos to records...</p>
                        {uploadQueue.map((item, index) => (
                            <div key={index} className="upload-item mb-3">
                                <div className="d-flex justify-content-between mb-2">
                                    <div>
                                        {item.file.name}
                                        <span className="badge ms-2">
                                            {item.type}
                                        </span>
                                    </div>
                                    <div className="upload-status">
                                        {item.status === "pending"
                                            ? "Pending"
                                            : item.status === "uploading"
                                                ? "Uploading..."
                                                : item.status === "completed"
                                                    ? "Completed"
                                                    : `Error: ${item.error}`}
                                    </div>
                                </div>
                                <div className="progress mb-1">
                                    <div
                                        className={`progress-bar ${item.status === "error" ? "bg-danger" : ""}`}
                                        role="progressbar"
                                        style={{ width: `${item.progress}%` }}
                                    >
                                        {item.progress}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    const handleNext = () => {
        if (step === "select") {
            groupVideos();
        } else if (step === "review") {
            createRecordsAndUpload();
        } else if (step === "upload") {
            onHide();
        }
    };

    const handleBack = () => {
        if (step === "review") {
            setStep("select")
        }
    };

    return (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {step === "select" ? "Batch Upload Videos" :
                                step === "review" ? "Review Records" :
                                    "Uploading Videos"}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onHide}
                            disabled={isCreatingRecords || isUploading}
                        ></button>
                    </div>
                    <div className="modal-body">
                        {error && (
                            <div className="alert alert-danger mb-3">
                                {error}
                            </div>
                        )}
                        {renderStepContent()}
                    </div>
                    <div className="modal-footer">
                        {step !== "select" && (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleBack}
                                disabled={isCreatingRecords || isUploading}
                            >
                                Back
                            </button>
                        )}
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleNext}
                            disabled={(step === "select" && (!batchName.trim())) || isCreatingRecords}
                        >
                            {step === "select" ? "Next" :
                                step === "review" ? (isCreatingRecords ? "Creating Records..." : "Create Records & Upload") :
                                    (isUploading ? "Uploading..." : "Close")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
