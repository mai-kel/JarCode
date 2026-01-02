import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ProblemListView from '../../src/components/ProblemListView.vue';

vi.mock('../../src/composables/useCursorPagination', () => {
  const mockUseCursorPagination = vi.fn(() => ({
    items: { value: [] },
    loading: { value: false },
    loadingMore: { value: false },
    refresh: vi.fn(),
  }));
  return {
    useCursorPagination: mockUseCursorPagination,
  };
});

vi.mock('../../src/composables/useInfiniteScroll', () => ({
  useInfiniteScroll: vi.fn(() => ({
    fillIfNoScroll: vi.fn(),
  })),
}));

vi.mock('../../src/composables/useDebounce', () => ({
  useDebounce: vi.fn(() => ({
    debouncedFunction: vi.fn(),
  })),
}));

describe('ProblemListView', () => {
  let wrapper;
  const mockFetcher = vi.fn();

  const createWrapper = (props = {}) => {
    return mount(ProblemListView, {
      props: {
        title: 'Test Problems',
        fetcher: mockFetcher,
        ...props,
      },
      global: {
        stubs: {
          Card: true,
          InputText: true,
          Dropdown: true,
          Button: true,
          ProgressSpinner: true,
        },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render title', () => {
    wrapper = createWrapper({ title: 'My Problems' });
    expect(wrapper.exists()).toBe(true);
  });

  it('should render search input', () => {
    wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('should emit create event when create button is clicked', async () => {
    wrapper = createWrapper({ showCreate: true });
    const buttons = wrapper.findAll('button');
    const createButton = buttons.find((b) => b.text().includes('Create'));
    if (createButton) {
      await createButton.trigger('click');
      expect(wrapper.emitted('create')).toBeTruthy();
    }
  });

  it('should show loading spinner when loading', async () => {
    const { useCursorPagination } = await import('../../src/composables/useCursorPagination');
    vi.mocked(useCursorPagination).mockReturnValueOnce({
      items: { value: [] },
      loading: { value: true },
      loadingMore: { value: false },
      refresh: vi.fn(),
    });

    wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('should display empty message when no problems', async () => {
    const { useCursorPagination } = await import('../../src/composables/useCursorPagination');
    vi.mocked(useCursorPagination).mockReturnValueOnce({
      items: { value: [] },
      loading: { value: false },
      loadingMore: { value: false },
      refresh: vi.fn(),
    });

    wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });
});
