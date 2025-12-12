/**
 * Converts an absolute URL to a relative URL by extracting just the path
 * This makes URLs portable across different environments (localhost, Railway, etc.)
 * 
 * Examples:
 * - "http://localhost:8000/media/image.jpg" -> "/media/image.jpg"
 * - "https://web-production-dfff.up.railway.app/media/image.jpg" -> "/media/image.jpg"
 * - "/media/image.jpg" -> "/media/image.jpg" (already relative)
 * - "data:image/..." -> "data:image/..." (data URL, keep as-is)
 */
export function toRelativeUrl(url: string | undefined): string {
  if (!url) return '';
  
  // Keep data URLs as-is
  if (url.startsWith('data:')) {
    return url;
  }
  
  // If already relative, return as-is
  if (url.startsWith('/')) {
    return url;
  }
  
  // Extract path from absolute URL
  try {
    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch (e) {
    // If URL parsing fails, return as-is
    console.warn('Failed to parse URL:', url, e);
    return url;
  }
}
