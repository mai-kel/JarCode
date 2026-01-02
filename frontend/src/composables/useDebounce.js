import { onBeforeUnmount } from 'vue';

/**
 * Composable for debouncing function calls
 * @param {Function} callback - Function to debounce
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @returns {Object} Object with debounced function and cancel method
 */
export function useDebounce(callback, delay = 300) {
  let timeoutId = null;

  const debouncedFunction = (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      callback(...args);
      timeoutId = null;
    }, delay);
  };

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  onBeforeUnmount(() => {
    cancel();
  });

  return {
    debouncedFunction,
    cancel,
  };
}
