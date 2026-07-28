/**
 * Safely parses multi-version image JSON strings or returns fallback raw URLs.
 * Works seamlessly with Pillow generated WebP variants: 'thumbnail' | 'medium' | 'large' | 'original'
 */
export function getImageVariantUrl(
  path?: string | Record<string, string> | null,
  variant: 'thumbnail' | 'medium' | 'large' | 'original' = 'thumbnail'
): string {
  if (!path) return '';

  if (typeof path === 'object' && path !== null) {
    return path[variant] || path.original || path.thumbnail || path.medium || Object.values(path)[0] || '';
  }

  if (typeof path === 'string') {
    const trimmed = path.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed[variant] || parsed.original || parsed.thumbnail || parsed.medium || Object.values(parsed)[0] || '';
        }
      } catch (e) {
        // Fallback to raw string if JSON parsing fails
      }
    }
    return trimmed;
  }

  return '';
}
