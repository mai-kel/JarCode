import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { useCursorPagination } from '../../../src/composables/useCursorPagination';

describe('useCursorPagination', () => {
  let mockFetcher;

  beforeEach(() => {
    mockFetcher = vi.fn();
  });

  const createTestComponent = (options = {}) => {
    return defineComponent({
      setup() {
        const pagination = useCursorPagination(mockFetcher, options);
        return {
          items: pagination.items,
          loading: pagination.loading,
          loadingMore: pagination.loadingMore,
          hasNext: pagination.hasNext,
          nextCursor: pagination.nextCursor,
          error: pagination.error,
          fetchPage: pagination.fetchPage,
          loadMore: pagination.loadMore,
          reset: pagination.reset,
          refresh: pagination.refresh,
        };
      },
      template: '<div></div>',
    });
  };

  it('should initialize with empty items and no cursor', () => {
    const wrapper = mount(createTestComponent({ initialLoad: false }));
    expect(wrapper.vm.items).toEqual([]);
    expect(wrapper.vm.nextCursor).toBeNull();
    expect(wrapper.vm.hasNext).toBe(false);
  });

  it('should set loading to true on initial load', async () => {
    mockFetcher.mockResolvedValue({
      results: [{ id: 1 }],
      next: '/api/test/?cursor=abc123',
    });

    mount(createTestComponent({ initialLoad: true }));

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockFetcher).toHaveBeenCalledWith(null);
  });

  it('should fetch page and update items', async () => {
    mockFetcher.mockResolvedValue({
      results: [{ id: 1 }, { id: 2 }],
      next: '/api/test/?cursor=abc123',
    });

    const wrapper = mount(createTestComponent({ initialLoad: false }));

    await wrapper.vm.fetchPage(null, false);

    expect(wrapper.vm.items).toEqual([{ id: 1 }, { id: 2 }]);
    expect(wrapper.vm.nextCursor).toBe('abc123');
    expect(wrapper.vm.hasNext).toBe(true);
  });

  it('should append items when loading more', async () => {
    mockFetcher
      .mockResolvedValueOnce({
        results: [{ id: 1 }],
        next: '/api/test/?cursor=abc123',
      })
      .mockResolvedValueOnce({
        results: [{ id: 2 }],
        next: null,
      });

    const wrapper = mount(createTestComponent({ initialLoad: false }));

    await wrapper.vm.fetchPage(null, false);
    expect(wrapper.vm.items).toEqual([{ id: 1 }]);

    await wrapper.vm.loadMore();
    expect(wrapper.vm.items).toEqual([{ id: 1 }, { id: 2 }]);
    expect(wrapper.vm.hasNext).toBe(false);
  });

  it('should handle fetch errors', async () => {
    const error = new Error('Fetch failed');
    mockFetcher.mockRejectedValue(error);

    const wrapper = mount(createTestComponent({ initialLoad: false }));

    await wrapper.vm.fetchPage(null, false);

    expect(wrapper.vm.error).toBe(error);
    expect(wrapper.vm.items).toEqual([]);
  });

  it('should not append items on error when appending', async () => {
    mockFetcher
      .mockResolvedValueOnce({
        results: [{ id: 1 }],
        next: '/api/test/?cursor=abc123',
      })
      .mockRejectedValueOnce(new Error('Failed'));

    const wrapper = mount(createTestComponent({ initialLoad: false }));

    await wrapper.vm.fetchPage(null, false);
    expect(wrapper.vm.items).toEqual([{ id: 1 }]);

    await wrapper.vm.loadMore();
    expect(wrapper.vm.items).toEqual([{ id: 1 }]);
  });

  it('should reset pagination state', async () => {
    mockFetcher.mockResolvedValue({
      results: [{ id: 1 }],
      next: '/api/test/?cursor=abc123',
    });

    const wrapper = mount(createTestComponent({ initialLoad: false }));

    await wrapper.vm.fetchPage(null, false);
    wrapper.vm.reset();

    expect(wrapper.vm.items).toEqual([]);
    expect(wrapper.vm.nextCursor).toBeNull();
    expect(wrapper.vm.error).toBeNull();
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.loadingMore).toBe(false);
  });

  it('should refresh pagination', async () => {
    mockFetcher.mockResolvedValue({
      results: [{ id: 1 }],
      next: null,
    });

    const wrapper = mount(createTestComponent({ initialLoad: false }));

    await wrapper.vm.fetchPage(null, false);
    mockFetcher.mockClear();

    await wrapper.vm.refresh();

    expect(mockFetcher).toHaveBeenCalledWith(null);
    expect(wrapper.vm.items).toEqual([{ id: 1 }]);
  });

  it('should not load more when already loading', async () => {
    let resolveFirst;
    const firstPromise = new Promise((resolve) => {
      resolveFirst = resolve;
    });

    mockFetcher
      .mockResolvedValueOnce({ results: [{ id: 1 }], next: '/api/test/?cursor=cursor123' })
      .mockReturnValueOnce(firstPromise);

    const wrapper = mount(createTestComponent({ initialLoad: false }));

    await wrapper.vm.fetchPage(null, false);
    expect(wrapper.vm.nextCursor).toBe('cursor123');
    mockFetcher.mockClear();
    mockFetcher.mockReturnValueOnce(firstPromise);

    const promise1 = wrapper.vm.loadMore();
    const promise2 = wrapper.vm.loadMore();

    resolveFirst({ results: [{ id: 2 }], next: null });
    await promise1;
    await promise2;

    expect(mockFetcher).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });

  it('should handle array response format', async () => {
    mockFetcher.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    const wrapper = mount(createTestComponent({ initialLoad: false }));

    await wrapper.vm.fetchPage(null, false);

    expect(wrapper.vm.items).toEqual([{ id: 1 }, { id: 2 }]);
    expect(wrapper.vm.nextCursor).toBeNull();
  });

  it('should handle response with data.results', async () => {
    mockFetcher.mockResolvedValue({
      data: {
        results: [{ id: 1 }],
        next: '/api/test/?cursor=xyz789',
      },
    });

    const wrapper = mount(createTestComponent({ initialLoad: false }));

    await wrapper.vm.fetchPage(null, false);

    expect(wrapper.vm.items).toEqual([{ id: 1 }]);
    expect(wrapper.vm.nextCursor).toBe('xyz789');
  });
});
