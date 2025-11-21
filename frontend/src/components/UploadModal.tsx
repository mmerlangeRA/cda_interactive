import React, { useEffect, useRef, useState } from "react";
import { RecordsAPI } from "../services/api";
import { BigFilesAPI, ChunkedUploadOptions } from "../services/bigFiles";
import { RecordType, VideoType } from "../types";
import { getVideoType, isVideoTypeCompliantWithRecord } from "../utils/videoAndRecord";

interface UploadModalProps {
  show: boolean;
  onHide: () => void;
  onComplete: (result?: { success: boolean; message: string }) => void;
  recordId: number;
  recordType: RecordType;
}

interface UploadItem {
  file: File;
  status: "pending" | "uploading" | "completed" | "error";
  progress: number;
  error?: string;
  useChunkedUpload?: boolean;
  type: VideoType;
  originalName: string;
  suggestedName: string;
  customName?: string;
  chunks?: {
    index: number;
    progress: number;
    status: "pending" | "uploading" | "completed" | "error";
  }[];
}

const UploadModal: React.FC<UploadModalProps> = ({
  show,
  onHide,
  onComplete,
  recordId,
  recordType,
}) => {
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chunkSizeInMo = 50;
  // Size threshold for chunked uploads ( chunkSizeInMo MB)
  const CHUNKED_UPLOAD_THRESHOLD = chunkSizeInMo * 1024 * 1024;

  // Reset state when modal is shown
  useEffect(() => {
    if (show) {
      setError(null);
      setUploadQueue([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [show]);


  // Validate files before adding them to the queue
  const validateFiles = (files: File[]): { valid: boolean; message?: string } => {
    if (files.length === 0) return { valid: true };

    // Check if all files are of the same type and different from record type
    const fileTypes = files.map(file => getVideoType(file.name));
    const uniqueTypes = new Set(fileTypes);

    if (uniqueTypes.size > 1) {
      return {
        valid: false,
        message: "All files must be of the same type (either all PHOTO or all PANORAMA)"
      };
    }

    if (!isVideoTypeCompliantWithRecord(fileTypes[0], recordType)) {
      return {
        valid: false,
        message: "All new videos should be of the type of the record"
      };
    }


    return { valid: true };
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      // Validate files
      const validation = validateFiles(files);
      if (!validation.valid) {
        setError(validation.message || "Invalid files");
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      // Clear any previous errors
      setError(null);

      // Process files and generate suggested names based on creation date
      const processedFiles = files.map((file) => {
        // Determine if this file should use chunked upload
        const shouldUseChunkedUpload = file.size > CHUNKED_UPLOAD_THRESHOLD;

        // Calculate number of chunks if using chunked upload
        const chunkSize = 5 * 1024 * 1024; // 5MB chunks
        const numChunks = shouldUseChunkedUpload
          ? Math.ceil(file.size / chunkSize)
          : 0;

        // Get file creation/modification date
        const fileDate = new Date(file.lastModified);

        // Format date as YYYYMMDD_HHMMSS
        const formattedDate = fileDate.toISOString()
          .replace(/[-:]/g, '')  // Remove dashes and colons
          .replace('T', '_')     // Replace T with underscore
          .slice(0, 15);         // Take only YYYYMMDD_HHMMSS part

        // Get original filename without extension
        const fileNameParts = file.name.split('.');
        const extension = fileNameParts.pop() || '';
        const baseName = fileNameParts.join('.');

        // Create suggested name with timestamp prefix
        const suggestedName = `${formattedDate}_${baseName}.${extension}`;

        return {
          file,
          status: "pending" as "pending" | "uploading" | "completed" | "error",
          progress: 0,
          type: getVideoType(file.name),
          originalName: file.name,
          suggestedName: suggestedName,
          useChunkedUpload: shouldUseChunkedUpload,
          chunks: shouldUseChunkedUpload
            ? Array.from({ length: numChunks }, (_, index) => ({
              index,
              progress: 0,
              status: "pending" as const
            }))
            : undefined
        };
      });

      setUploadQueue(processedFiles);
    }
  };

  const updateItemProgress = (index: number, progress: number) => {
    setUploadQueue((queue) =>
      queue.map((item, i) => (i === index ? { ...item, progress } : item))
    );
  };

  const updateItemStatus = (
    index: number,
    status: UploadItem["status"],
    error?: string
  ) => {
    setUploadQueue((queue) =>
      queue.map((item, i) => (i === index ? { ...item, status, error } : item))
    );
  };

  const updateChunkProgress = (itemIndex: number, chunkIndex: number, progress: number) => {
    setUploadQueue((queue) => {
      const newQueue = [...queue];
      const item = { ...newQueue[itemIndex] };

      if (item.chunks) {
        const chunks = [...item.chunks];
        chunks[chunkIndex] = {
          ...chunks[chunkIndex],
          progress
        };
        item.chunks = chunks;

        // Calculate overall progress based on all chunks
        const totalProgress = chunks.reduce((sum, chunk) => sum + chunk.progress, 0) / chunks.length;
        item.progress = Math.round(totalProgress);
      }

      newQueue[itemIndex] = item;
      return newQueue;
    });
  };

  const updateChunkStatus = (
    itemIndex: number,
    chunkIndex: number,
    status: "pending" | "uploading" | "completed" | "error"
  ) => {
    setUploadQueue((queue) => {
      const newQueue = [...queue];
      const item = { ...newQueue[itemIndex] };

      if (item.chunks) {
        const chunks = [...item.chunks];
        chunks[chunkIndex] = {
          ...chunks[chunkIndex],
          status
        };
        item.chunks = chunks;
      }

      newQueue[itemIndex] = item;
      return newQueue;
    });
  };

  const uploadFile = async (item: UploadItem, index: number) => {
    try {
      updateItemStatus(index, "uploading");

      // Determine which filename to use (custom name if provided, otherwise suggested name)
      const finalFileName = item.customName || item.suggestedName;
      // Use chunked upload for large files if enabled
      if (item.useChunkedUpload) {
        const options: ChunkedUploadOptions = {
          onProgress: (progress) => {
            updateItemProgress(index, progress);
          },
          onChunkProgress: (chunkIndex, progress) => {
            updateChunkProgress(index, chunkIndex, progress);
          },
          onChunkComplete: (chunkIndex) => {
            updateChunkStatus(index, chunkIndex, "completed");
          },
          onChunkError: (chunkIndex, error) => {
            updateChunkStatus(index, chunkIndex, "error");
            console.error(`Chunk ${chunkIndex} upload error:`, error);
          }
        };

        const result = await BigFilesAPI.uploadChunked(recordId, finalFileName, item.file, options);

        if (result.success) {
          updateItemStatus(index, "completed");
          updateItemProgress(index, 100);

          // Notify parent component of successful upload
          onComplete({
            success: true,
            message: `Successfully uploaded ${finalFileName}`
          });

          return true;
        } else {
          throw new Error(result.error || "Upload failed");
        }
      } else {
        // Regular upload for smaller files
        // Request upload URL with the final filename
        console.log("requestUpload finalBlobName=" + finalFileName)
        const uploadResponse = await RecordsAPI.requestUpload(recordId, {
          title: finalFileName,
          content_type: item.file.type || "video/360",
        });

        const { upload_url, blob_name } = uploadResponse.data;

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const percentComplete = Math.round((e.loaded / e.total) * 100);
              updateItemProgress(index, percentComplete);
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Upload failed"));
          });

          xhr.open("PUT", upload_url);
          xhr.setRequestHeader("x-ms-blob-type", "BlockBlob");
          xhr.setRequestHeader("Content-Type", item.file.type || "video/360");
          xhr.send(item.file);
        });

        // Ensure the blob_name has the correct file extension
        let finalBlobName = blob_name;

        // Extract the original file extension
        const fileExtension = item.file.name.split('.').pop();

        // If blob_name doesn't already have the correct extension, add it
        if (fileExtension && !finalBlobName.endsWith(`.${fileExtension}`)) {
          // Remove any existing extension (like .octet-stream)
          if (finalBlobName.includes('.')) {
            finalBlobName = finalBlobName.substring(0, finalBlobName.lastIndexOf('.'));
          }
          // Add the correct extension
          finalBlobName = `${finalBlobName}.${fileExtension}`;
        }

        // Get the file's date_time in ISO format
        const fileDateTime = new Date(item.file.lastModified).toISOString();

        // Confirm upload with the corrected blob name, final filename, and date_time
        await RecordsAPI.confirmUpload(recordId, {
          blob_name: finalBlobName,
          title: finalFileName,
          content_type: item.file.type || "video/360",
          date_time: fileDateTime,
        });

        updateItemStatus(index, "completed");
        updateItemProgress(index, 100);

        // Notify parent component of successful upload
        onComplete({
          success: true,
          message: `Successfully uploaded ${finalFileName}`
        });

        return true;
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Upload failed";

      updateItemStatus(index, "error", errorMessage);

      // Notify parent component of failed upload
      onComplete({
        success: false,
        message: `Failed to upload ${item.customName || item.suggestedName || item.file.name}: ${errorMessage}`
      });

      throw error;
    }
  };

  const handleUpload = async () => {
    if (uploadQueue.length === 0) {
      alert("Please select files to upload");
      return;
    }

    try {
      // Upload files in parallel
      const uploadPromises = uploadQueue.map((item, index) => {
        if (item.status === "completed") {
          return Promise.resolve(); // Skip already completed uploads
        }
        // Wrap each upload in a Promise that won't reject
        return uploadFile(item, index).catch((error) => {
          console.error(`Upload failed for ${item.file.name}:`, error);
          // Error is already handled in uploadFile function
          // Return undefined to continue with other uploads
        });
      });

      await Promise.all(uploadPromises);

      // Check if all files are either completed or errored
      const allFinished = uploadQueue.every(
        (item) => item.status === "completed" || item.status === "error"
      );

      if (allFinished) {
        // Check if at least one file was uploaded successfully
        const hasSuccessful = uploadQueue.some(
          (item) => item.status === "completed"
        );

        // Send a final summary to the parent component
        if (hasSuccessful) {
          const successCount = uploadQueue.filter(item => item.status === "completed").length;
          const errorCount = uploadQueue.filter(item => item.status === "error").length;

          onComplete({
            success: true,
            message: `Upload complete: ${successCount} file(s) uploaded successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`
          });
        } else {
          onComplete({
            success: false,
            message: "No files were uploaded successfully"
          });
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Upload Videos</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onHide}
            ></button>
          </div>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger mb-3">
                {error}
              </div>
            )}

            <div className="mb-3">
              <input
                type="file"
                className="form-control"
                accept="video/*,.360"
                multiple
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              <small className="text-muted d-block mt-1">
                Large files (&gt;{chunkSizeInMo}Mo) will be automatically uploaded in chunks for better reliability
              </small>
              <small className="text-muted d-block mt-1">
                Note: Files with .360 extension will be treated as PANORAMA type, all others as PHOTO type.
              </small>
            </div>

            <div className="upload-queue">
              {uploadQueue.map((item, index) => (
                <div key={index} className="upload-item mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <div>
                      <div>
                        <strong>Original:</strong> {item.originalName}
                        <span className={`badge ms-2 ${item.type === 'PANORAMA' ? 'bg-success' : 'bg-primary'}`}>
                          {item.type}
                        </span>
                      </div>
                      <div className="mt-1">
                        <strong>Suggested:</strong> {item.suggestedName}
                      </div>
                      {item.status === "pending" && (
                        <div className="mt-1">
                          <div className="input-group input-group-sm">
                            <span className="input-group-text">Custom name:</span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter custom name (optional)"
                              value={item.customName || ""}
                              onChange={(e) => {
                                const customName = e.target.value;
                                setUploadQueue((queue) =>
                                  queue.map((qItem, i) =>
                                    i === index ? { ...qItem, customName } : qItem
                                  )
                                );
                              }}
                            />
                          </div>
                          <small className="text-muted">
                            Leave empty to use the suggested name with timestamp
                          </small>
                        </div>
                      )}
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
                      className={`progress-bar ${item.status === "error" ? "bg-danger" : ""
                        }`}
                      role="progressbar"
                      style={{ width: `${item.progress}%` }}
                    >
                      {item.progress}%
                    </div>
                  </div>

                  {/* Show individual chunk progress for chunked uploads */}
                  {item.useChunkedUpload && item.chunks && item.status === "uploading" && (
                    <div className="chunks-progress mt-2">
                      <small className="d-block mb-1">Chunks progress:</small>
                      <div className="d-flex flex-wrap gap-1">
                        {item.chunks.map((chunk) => (
                          <div
                            key={chunk.index}
                            className="chunk-indicator"
                            style={{
                              width: '20px',
                              height: '10px',
                              backgroundColor:
                                chunk.status === 'completed' ? '#28a745' :
                                  chunk.status === 'error' ? '#dc3545' :
                                    chunk.status === 'uploading' ? '#007bff' : '#e9ecef',
                              borderRadius: '2px'
                            }}
                            title={`Chunk ${chunk.index + 1}: ${chunk.progress}%`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
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
              onClick={handleUpload}
              disabled={
                !!error ||
                uploadQueue.length === 0 ||
                uploadQueue.every((item) => item.status === "completed")
              }
            >
              Upload All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
