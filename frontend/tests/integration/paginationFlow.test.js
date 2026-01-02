import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { useCursorPagination } from '../../src/composables/useCursorPagination';

describe('Pagination Flow Integration', () => {
  let mockFetcher;

  beforeEach(() => {
    mockFetcher = vi.fn();
  });

  const createTestComponent = () => {
    return defineComponent({
      setup() {
        const pagination = useCursorPagination(mockFetcher, { initialLoad: false });
        return { ...pagination };
      },
      template: '<div></div>',
    });
  };

  it('should handle pagination flow: initial load -> load more -> refresh', async () => {
    mockFetcher
      .mockResolvedValueOnce({
        results: [{ id: 1 }, { id: 2 }],
        next: '/api/test/?cursor=abc123',
      })
      .mockResolvedValueOnce({
        results: [{ id: 3 }, { id: 4 }],
        next: null,
      })
      .mockResolvedValueOnce({
        results: [{ id: 5 }, { id: 6 }],
        next: '/api/test/?cursor=xyz789',
      });

    const wrapper = mount(createTestComponent());

    // Initial load
    await wrapper.vm.fetchPage(null, false);
    expect(wrapper.vm.items).toEqual([{ id: 1 }, { id: 2 }]);
    expect(wrapper.vm.hasNext).toBe(true);

    // Load more
    await wrapper.vm.loadMore();
    expect(wrapper.vm.items).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
    expect(wrapper.vm.hasNext).toBe(false);

    // Refresh
    await wrapper.vm.refresh();
    expect(wrapper.vm.items).toEqual([{ id: 5 }, { id: 6 }]);
    expect(wrapper.vm.hasNext).toBe(true);
  });

  it('should handle error during pagination', async () => {
    const error = new Error('Fetch failed');
    mockFetcher.mockRejectedValue(error);

    const wrapper = mount(createTestComponent());

    await wrapper.vm.fetchPage(null, false);

    expect(wrapper.vm.error).toBe(error);
    expect(wrapper.vm.items).toEqual([]);
  });
});
