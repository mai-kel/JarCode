import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';

/**
 * Composable for infinite scroll functionality
 * @param {Object} options - Configuration options
 * @param {import('vue').ComputedRef<boolean>|import('vue').Ref<boolean>} options.hasNext - Whether there are more items to load
 * @param {import('vue').ComputedRef<boolean>|import('vue').Ref<boolean>} options.loading - Loading state
 * @param {import('vue').ComputedRef<boolean>|import('vue').Ref<boolean>} [options.loadingMore] - Loading more state
 * @param {Function} options.onLoadMore - Callback function to load more items
 * @param {number} [options.threshold=200] - Scroll threshold in pixels before triggering load
 * @param {boolean} [options.useIntersectionObserver=false] - Use IntersectionObserver instead of scroll events
 * @param {import('vue').Ref} [options.observerTarget] - Target element for IntersectionObserver (required if useIntersectionObserver=true)
 * @param {boolean} [options.autoFill=true] - Automatically fill viewport if content doesn't fill it
 * @param {boolean} [options.autoFillOnce=false] - If true, only fill once on initial load (for scroll-based pagination). If false, keep filling until viewport is full.
 * @param {import('vue').Ref} [options.container] - Container element for auto-fill detection
 */
export function useInfiniteScroll(options) {
  const {
    hasNext,
    loading,
    loadingMore = ref(false),
    onLoadMore,
    threshold = 200,
    useIntersectionObserver = false,
    observerTarget = null,
    autoFill = true,
    autoFillOnce = false,
    container = null,
  } = options;

  const autoLoading = ref(false);
  const initialFillDone = ref(false);
  let scrollHandler = null;
  let intersectionObserver = null;

  /**
   * Checks if viewport needs to be filled and loads more if needed
   * @param {boolean} onlyOnce - If true, only fill once (for initial load)
   */
  const fillIfNoScroll = async (onlyOnce = false) => {
    if (autoLoading.value) return;
    if (onlyOnce && initialFillDone.value) return;

    autoLoading.value = true;

    try {
      if (onlyOnce) {
        await nextTick();

        const hasNextValue = typeof hasNext === 'function' ? hasNext() : hasNext.value;
        const loadingValue = typeof loading === 'function' ? loading() : loading.value;
        const loadingMoreValue =
          typeof loadingMore === 'function' ? loadingMore() : loadingMore.value;

        if (!hasNextValue || loadingValue || loadingMoreValue) {
          return;
        }

        let needsMore = false;

        if (container && container.value) {
          const containerEl = container.value;
          needsMore = containerEl.scrollHeight <= containerEl.clientHeight;
        } else {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const winH = window.innerHeight || document.documentElement.clientHeight;
          const docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
          const remainingScroll = docH - (scrollTop + winH);
          needsMore = remainingScroll < threshold || docH <= winH;
        }

        if (needsMore) {
          await onLoadMore();
        }
        initialFillDone.value = true;
      } else {
        while (true) {
          await nextTick();

          const hasNextValue = typeof hasNext === 'function' ? hasNext() : hasNext.value;
          const loadingValue = typeof loading === 'function' ? loading() : loading.value;
          const loadingMoreValue =
            typeof loadingMore === 'function' ? loadingMore() : loadingMore.value;

          if (!hasNextValue || loadingValue || loadingMoreValue) break;

          let needsMore = false;

          if (container && container.value) {
            const containerEl = container.value;
            needsMore = containerEl.scrollHeight <= containerEl.clientHeight;
          } else {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const winH = window.innerHeight || document.documentElement.clientHeight;
            const docH = Math.max(
              document.documentElement.scrollHeight,
              document.body.scrollHeight
            );
            const remainingScroll = docH - (scrollTop + winH);
            needsMore = remainingScroll < threshold || docH <= winH;
          }

          if (!needsMore) break;

          await onLoadMore();
        }
      }
    } finally {
      autoLoading.value = false;
    }
  };

  /**
   * Window scroll handler
   */
  const handleScroll = async () => {
    const hasNextValue = typeof hasNext === 'function' ? hasNext() : hasNext.value;
    const loadingValue = typeof loading === 'function' ? loading() : loading.value;
    const loadingMoreValue = typeof loadingMore === 'function' ? loadingMore() : loadingMore.value;

    if (!hasNextValue || loadingValue || loadingMoreValue) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const winH = window.innerHeight || document.documentElement.clientHeight;
    const docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);

    if (docH - (scrollTop + winH) < threshold) {
      await onLoadMore();
    }
  };

  /**
   * IntersectionObserver callback
   */
  const handleIntersection = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const hasNextValue = typeof hasNext === 'function' ? hasNext() : hasNext.value;
        const loadingValue = typeof loading === 'function' ? loading() : loading.value;
        const loadingMoreValue =
          typeof loadingMore === 'function' ? loadingMore() : loadingMore.value;

        if (hasNextValue && !loadingValue && !loadingMoreValue) {
          onLoadMore();
        }
      }
    });
  };

  if (useIntersectionObserver && observerTarget) {
    onMounted(() => {
      nextTick(() => {
        if (observerTarget.value) {
          intersectionObserver = new IntersectionObserver(handleIntersection, {
            root: container?.value || null,
            threshold: 0.1,
          });
          intersectionObserver.observe(observerTarget.value);
        }
      });
    });
  } else {
    onMounted(() => {
      scrollHandler = handleScroll;
      window.addEventListener('scroll', scrollHandler, { passive: true });

      if (autoFill) {
        nextTick(() => {
          setTimeout(() => {
            fillIfNoScroll(autoFillOnce);
          }, 150);
        });
      }
    });
  }

  if (autoFill && !useIntersectionObserver && !autoFillOnce) {
    watch([loading, loadingMore], ([newLoading, newLoadingMore], [oldLoading, oldLoadingMore]) => {
      if ((oldLoading && !newLoading) || (oldLoadingMore && !newLoadingMore)) {
        nextTick(() => {
          setTimeout(() => {
            fillIfNoScroll(false);
          }, 100);
        });
      }
    });
  }

  onBeforeUnmount(() => {
    if (scrollHandler) {
      window.removeEventListener('scroll', scrollHandler);
    }
    if (intersectionObserver) {
      intersectionObserver.disconnect();
    }
  });

  return {
    fillIfNoScroll,
  };
}
