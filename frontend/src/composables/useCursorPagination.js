import { ref, computed, onMounted } from 'vue';
import { normalizePage } from '../utils/pagination.js';

/**
 * Composable for cursor-based pagination
 * @param {Function} fetcher - Function that fetches a page (receives cursor and returns promise)
 * @param {Object} options - Configuration options
 * @param {boolean} [options.initialLoad=true] - Whether to load initial page on mount
 * @returns {Object} Pagination state and methods
 */
export function useCursorPagination(fetcher, options = {}) {
  const { initialLoad = true } = options;

  const items = ref([]);
  const loading = ref(initialLoad); // Set initial loading state
  const loadingMore = ref(false);
  const nextCursor = ref(null);
  const error = ref(null);

  const hasNext = computed(() => !!nextCursor.value);

  /**
   * Fetches a page of items
   * @param {string|null} cursor - Cursor for pagination (null for first page)
   * @param {boolean} append - Whether to append results to existing items
   */
  const fetchPage = async (cursor = null, append = false) => {
    if (append) {
      loadingMore.value = true;
    } else {
      loading.value = true;
    }
    error.value = null;

    try {
      const response = await fetcher(cursor);
      const page = normalizePage(response);

      nextCursor.value = page.next;

      if (append) {
        items.value = items.value.concat(page.results || []);
      } else {
        items.value = page.results || [];
      }
    } catch (err) {
      error.value = err;
      if (!append) {
        items.value = [];
      }
    } finally {
      loadingMore.value = false;
      loading.value = false;
    }
  };

  /**
   * Loads the next page
   */
  const loadMore = async () => {
    if (!nextCursor.value || loadingMore.value || loading.value) {
      return;
    }
    await fetchPage(nextCursor.value, true);
  };

  /**
   * Resets pagination state
   */
  const reset = () => {
    items.value = [];
    nextCursor.value = null;
    error.value = null;
    loading.value = false;
    loadingMore.value = false;
  };

  /**
   * Refreshes the current page (reloads from beginning)
   */
  const refresh = async () => {
    reset();
    await fetchPage(null, false);
  };

  // Initial load if enabled
  if (initialLoad) {
    onMounted(() => {
      fetchPage(null, false);
    });
  }

  return {
    items,
    loading,
    loadingMore,
    hasNext,
    nextCursor,
    error,
    fetchPage,
    loadMore,
    reset,
    refresh,
  };
}
