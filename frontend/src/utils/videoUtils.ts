/**
 * Extract the first frame from a video file as a compressed JPEG blob
 * @param videoUrl - URL of the video file
 * @param timestamp - Time in seconds to extract frame from (default: 0.1)
 * @param quality - JPEG quality 0-1 (default: 0.8)
 * @returns Promise<Blob> - Compressed JPEG image blob
 */
export async function extractVideoFrame(
  videoUrl: string,
  timestamp: number = 0.1,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = videoUrl;
    video.currentTime = timestamp;

    video.addEventListener('seeked', () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob from canvas'));
            }
          },
          'image/jpeg',
          quality
        );
      } catch (error) {
        reject(error);
      } finally {
        video.src = ''; // Clean up
      }
    });

    video.addEventListener('error', (e) => {
      reject(new Error(`Video loading error: ${e.message || 'Unknown error'}`));
    });

    video.load();
  });
}

/**
 * Convert a Blob to a File object
 * @param blob - The blob to convert
 * @param filename - The desired filename
 * @returns File object
 */
export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type });
}
