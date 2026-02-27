/**
 * Extract a Firebase Storage path from a download URL.
 *
 * Firebase Storage download URLs typically look like:
 *   https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<encoded-path>?alt=media&token=...
 *
 * This helper centralizes parsing so it can be updated in one place if the
 * URL format ever changes (CDN, custom domain, etc.).
 *
 * @param {string|null|undefined} url  A Firebase Storage download URL.
 * @returns {string|null}  The decoded storage path, or null if parsing fails.
 */
export function getStoragePathFromUrl(url) {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    const match = parsedUrl.pathname.match(/\/o\/(.*)$/);
    if (!match?.[1]) return null;
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}
