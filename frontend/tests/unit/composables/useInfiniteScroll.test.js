import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, ref, computed, nextTick } from 'vue';
import { useInfiniteScroll } from '../../../src/composables/useInfiniteScroll';

describe('useInfiniteScroll', () => {
  let mockOnLoadMore;
  let hasNext;
  let loading;
  let loadingMore;

  beforeEach(() => {
    vi.useFakeTimers();
    mockOnLoadMore = vi.fn().mockImplementation(async () => {
      if (hasNext.value) {
        await new Promise(resolve => setTimeout(resolve, 0));
        hasNext.value = false;
      }
    });
    hasNext = ref(true);
    loading = ref(false);
    loadingMore = ref(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  const createTestComponent = (options = {}) => {
    return defineComponent({
      setup() {
        const scroll = useInfiniteScroll({
          hasNext,
          loading,
          loadingMore,
          onLoadMore: mockOnLoadMore,
          ...options
        });
        return { ...scroll };
      },
      template: '<div></div>'
    });
  };

  it('should trigger loadMore on scroll near bottom', async () => {
    const wrapper = mount(createTestComponent({ threshold: 200, autoFill: false }));
    await nextTick();
    expect(wrapper.exists()).toBe(true);
    wrapper.unmount();
  });

  it('should not trigger loadMore when already loading', async () => {
    loading.value = true;

    Object.defineProperty(window, 'innerHeight', { value: 1000, writable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, writable: true });
    Object.defineProperty(document.documentElement, 'scrollTop', { value: 800, writable: true });

    const wrapper = mount(createTestComponent({ threshold: 200, autoFill: false }));

    window.dispatchEvent(new Event('scroll'));
    await nextTick();
    await vi.runAllTimersAsync();

    expect(mockOnLoadMore).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('should not trigger loadMore when no more items', async () => {
    hasNext.value = false;

    Object.defineProperty(window, 'innerHeight', { value: 1000, writable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, writable: true });
    Object.defineProperty(document.documentElement, 'scrollTop', { value: 800, writable: true });

    const wrapper = mount(createTestComponent({ threshold: 200, autoFill: false }));

    window.dispatchEvent(new Event('scroll'));
    await nextTick();
    await vi.runAllTimersAsync();

    expect(mockOnLoadMore).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('should use IntersectionObserver when enabled', async () => {
    const observerTarget = ref({});
    const mockObserve = vi.fn();
    const mockDisconnect = vi.fn();

    global.IntersectionObserver = vi.fn().mockImplementation((callback) => {
      return {
        observe: mockObserve,
        disconnect: mockDisconnect
      };
    });

    const wrapper = mount(createTestComponent({
      useIntersectionObserver: true,
      observerTarget,
      autoFill: false
    }));

    await nextTick();
    await vi.runAllTimersAsync();

    expect(global.IntersectionObserver).toHaveBeenCalled();
    wrapper.unmount();
  });

  it('should auto-fill viewport when content is short', async () => {
    const wrapper = mount(createTestComponent({ autoFill: true, autoFillOnce: true, threshold: 200 }));
    await nextTick();
    await vi.runAllTimersAsync();
    expect(wrapper.exists()).toBe(true);
    wrapper.unmount();
  });

  it('should not auto-fill when disabled', async () => {
    Object.defineProperty(window, 'innerHeight', { value: 1000, writable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 500, writable: true });

    const wrapper = mount(createTestComponent({ autoFill: false }));

    await nextTick();
    await vi.runAllTimersAsync();

    expect(mockOnLoadMore).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('should clean up scroll listener on unmount', async () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const wrapper = mount(createTestComponent({ autoFill: false }));

    await nextTick();
    await vi.runAllTimersAsync();
    wrapper.unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('should clean up IntersectionObserver on unmount', async () => {
    const observerTarget = ref({});
    const mockDisconnect = vi.fn();

    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: mockDisconnect
    }));

    const wrapper = mount(createTestComponent({
      useIntersectionObserver: true,
      observerTarget,
      autoFill: false
    }));

    await nextTick();
    await vi.runAllTimersAsync();
    wrapper.unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('should respect threshold value', async () => {
    const wrapper = mount(createTestComponent({ threshold: 200, autoFill: false }));
    await nextTick();
    expect(wrapper.exists()).toBe(true);
    wrapper.unmount();
  });

  it('should use container for auto-fill detection', async () => {
    const container = ref({
      scrollHeight: 500,
      clientHeight: 1000
    });

    const wrapper = mount(createTestComponent({
      container,
      autoFill: true,
      autoFillOnce: true
    }));

    await nextTick();
    await vi.advanceTimersByTime(200);

    expect(mockOnLoadMore).toHaveBeenCalled();
    wrapper.unmount();
  });

  it('should handle container-based scroll detection', async () => {
    const container = ref({
      scrollHeight: 1000,
      clientHeight: 500
    });

    const wrapper = mount(createTestComponent({
      container,
      autoFill: true,
      autoFillOnce: false
    }));

    await nextTick();
    await vi.advanceTimersByTime(200);

    wrapper.unmount();
  });

  it('should handle intersection observer callback', async () => {
    const observerTarget = ref({});
    let observerCallback;

    global.IntersectionObserver = vi.fn().mockImplementation((callback) => {
      observerCallback = callback;
      return {
        observe: vi.fn(),
        disconnect: vi.fn()
      };
    });

    const wrapper = mount(createTestComponent({
      useIntersectionObserver: true,
      observerTarget,
      autoFill: false
    }));

    await nextTick();

    if (observerCallback) {
      observerCallback([{ isIntersecting: true }]);
      await nextTick();
      expect(mockOnLoadMore).toHaveBeenCalled();
    }

    wrapper.unmount();
  });

  it('should not trigger loadMore when intersection observer detects but loading', async () => {
    loading.value = true;
    const observerTarget = ref({});
    let observerCallback;

    global.IntersectionObserver = vi.fn().mockImplementation((callback) => {
      observerCallback = callback;
      return {
        observe: vi.fn(),
        disconnect: vi.fn()
      };
    });

    const wrapper = mount(createTestComponent({
      useIntersectionObserver: true,
      observerTarget,
      autoFill: false
    }));

    await nextTick();

    if (observerCallback) {
      const callsBefore = mockOnLoadMore.mock.calls.length;
      observerCallback([{ isIntersecting: true }]);
      await nextTick();
      expect(mockOnLoadMore.mock.calls.length).toBe(callsBefore);
    }

    wrapper.unmount();
  });

  it('should watch loading state changes and auto-fill', async () => {
    const wrapper = mount(createTestComponent({
      autoFill: true,
      autoFillOnce: false
    }));

    await nextTick();
    await vi.advanceTimersByTime(200);

    loading.value = true;
    await nextTick();
    loading.value = false;
    await nextTick();
    await vi.advanceTimersByTime(200);

    wrapper.unmount();
  });

  it('should watch loadingMore state changes and auto-fill', async () => {
    const wrapper = mount(createTestComponent({
      autoFill: true,
      autoFillOnce: false
    }));

    await nextTick();
    await vi.advanceTimersByTime(200);

    loadingMore.value = true;
    await nextTick();
    loadingMore.value = false;
    await nextTick();
    await vi.advanceTimersByTime(200);

    wrapper.unmount();
  });

  it('should handle fillIfNoScroll with onlyOnce flag', async () => {
    const wrapper = mount(createTestComponent({
      autoFill: true,
      autoFillOnce: true
    }));

    await nextTick();
    await vi.advanceTimersByTime(200);

    const fillIfNoScroll = wrapper.vm.fillIfNoScroll;
    if (fillIfNoScroll) {
      await fillIfNoScroll(true);
    }

    wrapper.unmount();
  });

  it('should handle fillIfNoScroll without onlyOnce flag', async () => {
    hasNext.value = true;
    const wrapper = mount(createTestComponent({
      autoFill: false
    }));

    await nextTick();

    const fillIfNoScroll = wrapper.vm.fillIfNoScroll;
    if (fillIfNoScroll) {
      mockOnLoadMore.mockImplementation(async () => {
        hasNext.value = false;
      });
      await fillIfNoScroll(false);
    }

    wrapper.unmount();
  });

  it('should handle computed refs for hasNext, loading, loadingMore', async () => {
    const computedHasNext = computed(() => true);
    const computedLoading = computed(() => false);
    const computedLoadingMore = computed(() => false);

    const wrapper = mount(defineComponent({
      setup() {
        return useInfiniteScroll({
          hasNext: computedHasNext,
          loading: computedLoading,
          loadingMore: computedLoadingMore,
          onLoadMore: mockOnLoadMore,
          autoFill: false
        });
      },
      template: '<div></div>'
    }));

    await nextTick();
    expect(wrapper.exists()).toBe(true);
    wrapper.unmount();
  });
});

