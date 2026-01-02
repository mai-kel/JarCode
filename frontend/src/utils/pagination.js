/**
 * Extracts cursor value from a pagination URL
 * @param {string|null|undefined} url - The pagination URL (next/previous)
 * @returns {string|null} The cursor value or null if not found
 */
export function extractCursor(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.searchParams.get('cursor');
  } catch (_e) {
    // Fallback for relative URLs or malformed URLs
    const m = url.match(/[?&]cursor=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }
}

/**
 * Normalizes various API response formats into a standard pagination format
 * @param {*} response - API response (can be array, object with results, or object with data.results)
 * @returns {Object} Normalized pagination object with {results: Array, next: string|null}
 */
export function normalizePage(response) {
  if (!response) return { results: [], next: null };

  // If response is already an array
  if (Array.isArray(response)) {
    return { results: response, next: null };
  }

  // If response has results property directly
  if (response.results !== undefined) {
    return {
      results: response.results || [],
      next: extractCursor(response.next),
    };
  }

  // If response has data property
  if (response.data !== undefined) {
    // If data is an array
    if (Array.isArray(response.data)) {
      return { results: response.data, next: null };
    }
    // If data has results property
    if (response.data.results !== undefined) {
      return {
        results: response.data.results || [],
        next: extractCursor(response.data.next),
      };
    }
  }

  // Default fallback
  return { results: [], next: null };
}
