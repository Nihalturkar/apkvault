/**
 * Convert app name to URL-safe slug
 * "My Cool App" → "my-cool-app"
 */
export function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Format file size for display
 * 1048576 → "1.0 MB"
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

/**
 * Turn any Google Drive share link into a direct-download URL.
 * Returns the input unchanged if no Drive file id is found.
 */
export function toDriveDownloadUrl(url) {
  const m = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?.*id=)([\w-]+)/);
  return m ? `https://drive.google.com/uc?export=download&confirm=t&id=${m[1]}` : url.trim();
}
