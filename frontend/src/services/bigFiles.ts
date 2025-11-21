import { RecordsAPI } from "./api";

/**
 * Configuration options for chunked uploads
 */
export interface ChunkedUploadOptions {
    /** Size of each chunk in bytes (default: 5MB) */
    chunkSize?: number;
    /** Maximum number of concurrent chunk uploads (default: 3) */
    maxConcurrent?: number;
    /** Callback for progress updates */
    onProgress?: (progress: number) => void;
    /** Callback for individual chunk progress */
    onChunkProgress?: (chunkIndex: number, progress: number) => void;
    /** Callback for when a chunk upload completes */
    onChunkComplete?: (chunkIndex: number) => void;
    /** Callback for when a chunk upload fails */
    onChunkError?: (chunkIndex: number, error: Error) => void;
}

/**
 * Result of a chunked upload operation
 */
export interface ChunkedUploadResult {
    success: boolean;
    blob_name?: string;
    error?: string;
}

/**
 * Uploads a large file to Azure Blob Storage in chunks
 * 
 * @param recordId The ID of the record to upload to
 * @param file The file to upload
 * @param options Upload options
 * @returns A promise that resolves when the upload is complete
 */
export async function uploadFileInChunks(
    recordId: number,
    title: string,
    file: File,
    options: ChunkedUploadOptions = {}
): Promise<ChunkedUploadResult> {
    // Default options
    const chunkSize = options.chunkSize || 5 * 1024 * 1024; // 5MB default chunk size
    const maxConcurrent = options.maxConcurrent || 3;
    const onProgress = options.onProgress || (() => { });
    const onChunkProgress = options.onChunkProgress || (() => { });
    const onChunkComplete = options.onChunkComplete || (() => { });
    const onChunkError = options.onChunkError || (() => { });

    try {
        // Step 1: Request upload URL from the server
        const uploadResponse = await RecordsAPI.requestUpload(recordId, {
            title: title,
            content_type: file.type || "application/octet-stream",
        });

        const { upload_url, blob_name } = uploadResponse.data;

        // Parse the SAS URL to get the base URL and SAS token
        const url = new URL(upload_url);
        const sasToken = url.search.substring(1); // Remove the leading '?'
        const baseUrl = upload_url.split('?')[0];

        // Step 2: Calculate the number of chunks
        const fileSize = file.size;
        const numChunks = Math.ceil(fileSize / chunkSize);
        const blockIds: string[] = [];

        // Step 3: Generate block IDs (Base64 encoded)
        for (let i = 0; i < numChunks; i++) {
            // Create a block ID with leading zeros for proper ordering
            const blockId = btoa(`block-${i.toString().padStart(8, '0')}`);
            blockIds.push(blockId);
        }

        // Step 4: Upload each chunk as a block
        let completedChunks = 0;
        let failedChunks = 0;
        let activeUploads = 0;
        let chunkIndex = 0;

        // Function to upload a single chunk
        const uploadChunk = async (index: number): Promise<void> => {
            const start = index * chunkSize;
            const end = Math.min(start + chunkSize, fileSize);
            const chunk = file.slice(start, end);
            const blockId = blockIds[index];

            try {
                // Upload the chunk as a block
                const blockUrl = `${baseUrl}?comp=block&blockid=${encodeURIComponent(blockId)}&${sasToken}`;

                await new Promise<void>((resolve, reject) => {
                    const xhr = new XMLHttpRequest();

                    xhr.upload.addEventListener('progress', (e) => {
                        if (e.lengthComputable) {
                            const chunkProgress = Math.round((e.loaded / e.total) * 100);
                            onChunkProgress(index, chunkProgress);

                            // Calculate overall progress
                            const overallProgress = Math.round(
                                ((completedChunks * chunkSize) + (e.loaded * (end - start) / e.total)) / fileSize * 100
                            );
                            onProgress(overallProgress);
                        }
                    });

                    xhr.addEventListener('load', () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve();
                        } else {
                            reject(new Error(`Block upload failed with status ${xhr.status}`));
                        }
                    });

                    xhr.addEventListener('error', () => {
                        reject(new Error('Block upload failed'));
                    });

                    xhr.open('PUT', blockUrl);
                    xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');
                    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
                    xhr.send(chunk);
                });

                completedChunks++;
                onChunkComplete(index);

            } catch (error) {
                failedChunks++;
                onChunkError(index, error instanceof Error ? error : new Error('Unknown error'));
                throw error;
            } finally {
                activeUploads--;
            }
        };

        // Process chunks with concurrency control
        return new Promise<ChunkedUploadResult>((resolve) => {
            const processQueue = async () => {
                // If all chunks are processed, commit the blocks
                if (chunkIndex >= numChunks) {
                    if (activeUploads === 0) {
                        if (failedChunks > 0) {
                            resolve({
                                success: false,
                                error: `${failedChunks} chunks failed to upload`
                            });
                            return;
                        }

                        try {
                            // Step 5: Commit the blocks to create the final blob
                            const commitUrl = `${baseUrl}?comp=blocklist&${sasToken}`;
                            const blockListXml = `<?xml version="1.0" encoding="utf-8"?>
                <BlockList>
                  ${blockIds.map(id => `<Latest>${id}</Latest>`).join('')}
                </BlockList>`;

                            await new Promise<void>((resolveCommit, rejectCommit) => {
                                const xhr = new XMLHttpRequest();

                                xhr.addEventListener('load', () => {
                                    if (xhr.status >= 200 && xhr.status < 300) {
                                        resolveCommit();
                                    } else {
                                        rejectCommit(new Error(`Commit failed with status ${xhr.status}`));
                                    }
                                });

                                xhr.addEventListener('error', () => {
                                    rejectCommit(new Error('Commit failed'));
                                });

                                xhr.open('PUT', commitUrl);
                                xhr.setRequestHeader('Content-Type', 'application/xml');
                                xhr.send(blockListXml);
                            });

                            // Step 6: Confirm the upload with the server
                            // Ensure the blob_name has the correct file extension
                            let finalBlobName = blob_name;

                            // Extract the original file extension
                            const fileExtension = file.name.split('.').pop();

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
                            const fileDateTime = new Date(file.lastModified).toISOString();

                            await RecordsAPI.confirmUpload(recordId, {
                                blob_name: finalBlobName,
                                title,  // Use the title parameter (which is the finalFileName)
                                content_type: file.type || "application/octet-stream",
                                date_time: fileDateTime,
                            });

                            resolve({
                                success: true,
                                blob_name: finalBlobName
                            });
                        } catch (error) {
                            resolve({
                                success: false,
                                error: error instanceof Error ? error.message : 'Unknown error during commit'
                            });
                        }
                    }
                    return;
                }

                // If we have capacity, start a new chunk upload
                if (activeUploads < maxConcurrent && chunkIndex < numChunks) {
                    const currentChunkIndex = chunkIndex++;
                    activeUploads++;

                    uploadChunk(currentChunkIndex).catch(() => {
                        // Individual chunk errors are handled in uploadChunk
                        // Just make sure we continue processing the queue
                    }).finally(() => {
                        // Process the next chunk
                        processQueue();
                    });

                    // Continue processing more chunks if possible
                    processQueue();
                }
            };

            // Start processing the queue
            processQueue();
        });

    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Enhanced version of RecordsAPI with chunked upload support
 */
export const BigFilesAPI = {
    /**
     * Upload a file in chunks to Azure Blob Storage
     * 
     * @param recordId The ID of the record to upload to
     * @param file The file to upload
     * @param options Upload options
     * @returns A promise that resolves when the upload is complete
     */
    uploadChunked: async (
        recordId: number,
        title: string,
        file: File,
        options: ChunkedUploadOptions = {}
    ): Promise<ChunkedUploadResult> => {
        return uploadFileInChunks(recordId, title, file, options);
    }
};
