import { useRef, useState } from "react";
import { useError } from "../../contexts/ErrorContext";
import { useSuccess } from "../../contexts/SuccessContext";
import { RecordsAPI } from "../../services/api";
import { BigFilesAPI, ChunkedUploadOptions } from "../../services/bigFiles";
import { Network, VideoTypeEnum } from "../../types";
import { defaultSrid } from "../../utils/defaultValues";
import { getVideoType } from "../../utils/videoAndRecord";

interface VideoFile {
    file: File;
    type: VideoTypeEnum;
    lastModified: number;
}

export interface RecordGroup {
    type: VideoTypeEnum;
    lastModifiedDate: Date;
    videos: VideoFile[];
    recordName: string;
    recordId?: number;
}

interface UploadItem {
    file: File;
    recordId: number;
    status: "pending" | "uploading" | "completed" | "error";
    progress: number;
    error?: string;
    useChunkedUpload?: boolean;
    originalName: string;
    suggestedName: string;
    customName?: string;
    type: VideoTypeEnum;
    chunks?: {
        index: number;
        progress: number;
        status: "pending" | "uploading" | "completed" | "error";
    }[];
}

export const useBatchUpload = (
    selectedNetwork: Network,
    onHide: () => void,
    onComplete: (result?: { success: boolean; message: string }) => void,
    timeWindowMs: number = 300000 // Default to 5 minutes (300000 ms)
) => {
    const [batchName, setBatchName] = useState<string>("");
    const [batchSrid, setBatchSrid] = useState<number>(defaultSrid);
    const [selectedFiles, setSelectedFiles] = useState<VideoFile[]>([]);
    const [recordGroups, setRecordGroups] = useState<RecordGroup[]>([]);
    const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { setError: setGlobalError } = useError();
    const { setSuccess: setGlobalSuccess } = useSuccess();
    const [step, setStep] = useState<"select" | "review" | "upload">("select");
    const [isCreatingRecords, setIsCreatingRecords] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB
    const CHUNKED_UPLOAD_THRESHOLD = 50 * 1024 * 1024; // 50 MB

    // Reset state when modal opens
    const resetState = () => {
        setBatchName("");
        setSelectedFiles([]);
        setRecordGroups([]);
        setUploadQueue([]);
        setError(null);
        setStep("select");
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFileSelect = (files: FileList) => {
        const newVideoFiles: VideoFile[] = Array.from(files).map((file) => ({
            file,
            type: getVideoType(file.name),
            lastModified: file.lastModified
        }));

        // Append new files to existing ones instead of replacing
        setSelectedFiles(prevFiles => [...prevFiles, ...newVideoFiles]);

        console.log("Added files:", newVideoFiles.length);
    };

    const groupVideos = () => {
        if (!batchName.trim()) {
            setError("Please enter a batch name");
            return;
        }

        const sortedFiles = [...selectedFiles].sort((a, b) => a.lastModified - b.lastModified);
        const groups: RecordGroup[] = [];

        sortedFiles.forEach((videoFile) => {
            const existingGroupIndex = groups.findIndex((group) =>
                group.type === videoFile.type &&
                Math.abs(videoFile.lastModified - group.lastModifiedDate.getTime()) <= timeWindowMs
            );

            if (existingGroupIndex >= 0) {
                groups[existingGroupIndex].videos.push(videoFile);
            } else {
                groups.push({
                    type: videoFile.type,
                    lastModifiedDate: new Date(videoFile.lastModified),
                    videos: [videoFile],
                    recordName: `${batchName} ${groups.length + 1}`
                });
            }
        });

        setRecordGroups(groups);
        setStep("review");
    };

    const createRecordsAndUpload = async () => {
        if (recordGroups.length === 0) {
            setError("No record groups to create");
            return;
        }

        setIsCreatingRecords(true);

        try {
            const createdGroups = await Promise.all(
                recordGroups.map(async (group) => {
                    const response = await RecordsAPI.create({
                        name: group.recordName,
                        srid: batchSrid,
                        date_time: new Date().toISOString(),
                        network_uuid: selectedNetwork.uuid,
                        network_slug: selectedNetwork.slug
                    });

                    return { ...group, recordId: response.data.id };
                })
            );

            setRecordGroups(createdGroups);

            // Create upload queue
            const queue: UploadItem[] = createdGroups.flatMap((group) =>
                group.videos.map((videoFile) => {
                    const useChunkedUpload = videoFile.file.size > CHUNKED_UPLOAD_THRESHOLD;
                    const numChunks = useChunkedUpload
                        ? Math.ceil(videoFile.file.size / CHUNK_SIZE)
                        : 0;

                    // Get file creation/modification date
                    const fileDate = new Date(videoFile.file.lastModified);

                    // Format date as YYYYMMDD_HHMMSS
                    const formattedDate = fileDate.toISOString()
                        .replace(/[-:]/g, '')  // Remove dashes and colons
                        .replace('T', '_')     // Replace T with underscore
                        .slice(0, 15);         // Take only YYYYMMDD_HHMMSS part

                    // Get original filename without extension
                    const fileNameParts = videoFile.file.name.split('.');
                    const extension = fileNameParts.pop() || '';
                    const baseName = fileNameParts.join('.');

                    // Create suggested name with timestamp prefix
                    const suggestedName = `${formattedDate}_${baseName}.${extension}`;

                    return {
                        file: videoFile.file,
                        recordId: group.recordId!,
                        status: "pending",
                        progress: 0,
                        type: videoFile.type,
                        originalName: videoFile.file.name,
                        suggestedName: suggestedName,
                        useChunkedUpload,
                        chunks: useChunkedUpload
                            ? Array.from({ length: numChunks }, (_, index) => ({
                                index,
                                progress: 0,
                                status: "pending",
                            }))
                            : undefined,
                    };
                })
            );

            setUploadQueue(queue);
            setStep("upload");
            setIsCreatingRecords(false);
            // Start uploading
            setIsUploading(true);
            await uploadFiles(queue);
        } catch (err) {
            setError(`Failed to create records: ${err}`);
        } finally {
            setIsCreatingRecords(false);
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

                // Determine which filename to use (custom name if provided, otherwise suggested name)
                const finalFileName = item.customName || item.suggestedName;

                const result = await BigFilesAPI.uploadChunked(item.recordId, finalFileName, item.file, options);

                if (result.success) {
                    updateItemStatus(index, "completed");
                    updateItemProgress(index, 100);
                    return true;
                } else {
                    throw new Error(result.error || "Upload failed");
                }
            } else {
                // Determine which filename to use (custom name if provided, otherwise suggested name)
                const finalFileName = item.customName || item.suggestedName;

                // Regular upload for smaller files
                // Request upload URL with the final filename
                const uploadResponse = await RecordsAPI.requestUpload(item.recordId, {
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
                await RecordsAPI.confirmUpload(item.recordId, {
                    blob_name: finalBlobName,
                    title: finalFileName,
                    content_type: item.file.type || "video/360",
                    date_time: fileDateTime,
                });

                updateItemStatus(index, "completed");
                updateItemProgress(index, 100);
                return true;
            }
        } catch (error) {
            console.error("Upload error:", error);
            const errorMessage = error instanceof Error ? error.message : "Upload failed";

            updateItemStatus(index, "error", errorMessage);
            throw error;
        }
    };

    const uploadFiles = async (queue: UploadItem[]) => {
        try {
            // Upload files in parallel (max 3 at a time)
            const maxConcurrent = 3;
            let activeUploads = 0;
            let currentIndex = 0;

            // Track the status of each item in the queue
            const queueStatus: { [index: number]: "completed" | "error" } = {};

            return new Promise<void>((resolve) => {
                const processQueue = async () => {
                    // If all files are processed, we're done
                    if (currentIndex >= queue.length && activeUploads === 0) {
                        setIsUploading(false);

                        // Use the queueStatus to determine success/failure
                        const successCount = Object.values(queueStatus).filter(status => status === "completed").length;
                        const errorCount = Object.values(queueStatus).filter(status => status === "error").length;

                        // If we have at least one successful upload
                        if (successCount > 0) {
                            const recordCount = recordGroups.length;
                            const successMessage = `Batch upload complete: Created ${recordCount} records with ${successCount} file(s) uploaded successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`;
                            setGlobalSuccess(successMessage);
                            console.log(successMessage)
                            onComplete({
                                success: true,
                                message: successMessage
                            });
                        } else if (queue.length > 0) {
                            // Only show error if we had files to upload
                            onComplete({
                                success: false,
                                message: "No files were uploaded successfully"
                            });
                        }

                        resolve();
                        return;
                    }

                    // If we have capacity, start a new upload
                    if (activeUploads < maxConcurrent && currentIndex < queue.length) {
                        const itemIndex = currentIndex++;
                        activeUploads++;

                        uploadFile(queue[itemIndex], itemIndex)
                            .then(() => {
                                // Mark as completed
                                queueStatus[itemIndex] = "completed";
                            })
                            .catch(() => {
                                // Mark as error
                                queueStatus[itemIndex] = "error";
                            })
                            .finally(() => {
                                activeUploads--;
                                // Process the next item
                                processQueue();
                            });

                        // Continue processing more items if possible
                        processQueue();
                    }
                };

                // Start processing the queue
                processQueue();
            });
        } catch (error) {
            console.error("Upload error:", error);
            setGlobalError("Failed to upload files: " + (error instanceof Error ? error.message : String(error)));
            setIsUploading(false);
        }
    };



    // Add ability to remove a file from selection
    const removeFile = (index: number) => {
        setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    // Add ability to clear all selected files
    const clearFiles = () => {
        setSelectedFiles([]);
    };

    return {
        setStep,
        batchName,
        batchSrid,
        setBatchName,
        setBatchSrid,
        selectedFiles,
        handleFileSelect,
        removeFile,
        clearFiles,
        groupVideos,
        recordGroups,
        createRecordsAndUpload,
        uploadQueue,
        error,
        step,
        isCreatingRecords,
        isUploading,
        resetState,
    };
};
