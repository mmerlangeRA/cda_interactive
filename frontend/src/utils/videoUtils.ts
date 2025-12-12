/**
 * Extract the first frame from a video file as a compressed JPEG blob
 * @param videoUrl - URL of the video file
 * @param timestamp - Time in seconds to extract frame from (default: 0.1)
 * @param quality - JPEG quality 0-1 (default: 0.8)
 * @returns Promise<Blob> - Compressed JPEG image blob
 */
export async function extractVideoFrame(
  videoUrl: string,
  timestamp = 0.1,
  quality = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");

    // iOS/Safari friendliness
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    // If the URL is cross-origin, the server MUST send CORS headers.
    // Otherwise drawing to canvas will taint it and toBlob can fail.
    video.crossOrigin = "anonymous";

    let settled = false;

    const cleanup = () => {
      video.pause();
      video.removeAttribute("src");
      video.load(); // helps release memory in some browsers
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
    };

    const fail = (err: unknown) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(err instanceof Error ? err : new Error(String(err)));
    };

    const succeed = (blob: Blob) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(blob);
    };

    const onError = () => {
      // video.error is more reliable than event message
      const code = video.error?.code;
      fail(new Error(`Video loading/decoding error${code ? ` (code ${code})` : ""}`));
    };

    const grabFrame = () => {
      try {
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (!w || !h) {
          fail(new Error("Video dimensions not available (videoWidth/videoHeight are 0)."));
          return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          fail(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(video, 0, 0, w, h);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              fail(
                new Error(
                  "Failed to create blob from canvas. If the video is cross-origin, ensure the server sends CORS headers (or use same-origin / a proxy)."
                )
              );
              return;
            }
            succeed(blob);
          },
          "image/jpeg",
          quality
        );
      } catch (e) {
        fail(e);
      }
    };

    const onSeeked = () => {
      // Some browsers fire seeked before the frame is actually ready to paint.
      // A double rAF usually stabilizes it.
      requestAnimationFrame(() => requestAnimationFrame(grabFrame));
    };

    const onLoadedMetadata = async () => {
      try {
        // clamp timestamp into [0, duration]
        const duration = Number.isFinite(video.duration) ? video.duration : 0;
        const t = Math.min(Math.max(timestamp, 0), duration || timestamp);

        // If duration is Infinity (live stream) or still not seekable, wait a tick.
        // Also avoid setting currentTime while readyState is too low.
        if (video.readyState < 1) {
          await new Promise((r) => setTimeout(r, 0));
        }

        video.addEventListener("seeked", onSeeked, { once: true });

        // Safari sometimes needs a play/pause nudge to decode the first frame.
        try {
          const p = video.play();
          if (p && typeof (p as Promise<void>).then === "function") {
            await p.catch(() => {});
          }
          video.pause();
        } catch {
          // ignore autoplay restrictions
        }

        video.currentTime = t;

        // Fallback: if 'seeked' never fires, try grabbing after a short delay.
        setTimeout(() => {
          if (!settled) grabFrame();
        }, 1500);
      } catch (e) {
        fail(e);
      }
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata, { once: true });
    video.addEventListener("error", onError);

    video.src = videoUrl;
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
