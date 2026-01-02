import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ProblemSubmissionsPanel from '../../src/components/ProblemSubmissionsPanel.vue';
import { mockProblem } from '../../src/test/fixtures/problems.js';
import { mockSubmissions } from '../../src/test/fixtures/submissions.js';

vi.mock('../../src/components/editors/MonacoCodeEditor.vue', () => ({
  default: {
    name: 'MonacoCodeEditor',
    template: '<div class="monaco-editor-mock"><pre>{{ modelValue }}</pre></div>',
    props: ['modelValue', 'language', 'readOnly', 'height'],
    emits: ['update:modelValue'],
  },
}));

vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((html) => html),
  },
}));

vi.mock('marked', () => ({
  marked: {
    parse: vi.fn((markdown) => `<p>${markdown}</p>`),
  },
}));

describe('ProblemSubmissionsPanel', () => {
  let wrapper;
  let mockIntersectionObserver;

  beforeEach(() => {
    vi.useFakeTimers();

    mockIntersectionObserver = {
      observe: vi.fn(),
      disconnect: vi.fn(),
      unobserve: vi.fn(),
    };

    global.IntersectionObserver = vi.fn().mockImplementation(() => mockIntersectionObserver);

    Object.defineProperty(window, 'innerHeight', {
      value: 2000,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 2000,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document.body, 'scrollHeight', {
      value: 2000,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      value: 2000,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  const createWrapper = (props = {}) => {
    const defaultProps = {
      submissions: [],
      loading: false,
      selected: null,
      problem: mockProblem,
      hasNext: false,
      loadingMore: false,
      ...props,
    };

    const wrapper = mount(ProblemSubmissionsPanel, {
      props: defaultProps,
      global: {
        stubs: {
          Card: {
            template: '<div class="card"><slot name="title" /><slot name="content" /></div>',
          },
          ProgressSpinner: {
            template: '<div class="spinner">Loading...</div>',
          },
        },
      },
    });

    return wrapper;
  };

  it('should render submissions list', () => {
    wrapper = createWrapper({ submissions: mockSubmissions });
    expect(wrapper.text()).toContain('Submissions');
  });

  it('should show loading spinner when loading', () => {
    wrapper = createWrapper({ loading: true });
    expect(wrapper.find('.spinner').exists()).toBe(true);
  });

  it('should display empty message when no submissions', () => {
    wrapper = createWrapper({ submissions: [] });
    expect(wrapper.text()).toContain('No submissions yet.');
  });

  it('should render submission items', () => {
    wrapper = createWrapper({ submissions: mockSubmissions });
    const items = wrapper.findAll('li');
    expect(items.length).toBe(mockSubmissions.length);
  });

  it('should display submission date', () => {
    wrapper = createWrapper({ submissions: [mockSubmissions[0]] });
    expect(wrapper.text()).toContain('2024');
  });

  it('should display submission status', () => {
    wrapper = createWrapper({ submissions: [mockSubmissions[0]] });
    expect(wrapper.text()).toContain('Status:');
  });

  it('should emit select event when submission is clicked', async () => {
    wrapper = createWrapper({ submissions: mockSubmissions });
    const firstItem = wrapper.find('li');

    await firstItem.trigger('click');

    expect(wrapper.emitted('select')).toBeTruthy();
    expect(wrapper.emitted('select')[0][0]).toEqual(mockSubmissions[0]);
  });

  it('should highlight selected submission', () => {
    wrapper = createWrapper({
      submissions: mockSubmissions,
      selected: mockSubmissions[0],
    });

    const firstItem = wrapper.find('li');
    expect(firstItem.classes()).toContain('bg-100');
  });

  it('should show progress spinner for non-evaluated submissions', () => {
    const evaluatingSubmission = {
      ...mockSubmissions[0],
      status: 'EVALUATING',
    };
    wrapper = createWrapper({ submissions: [evaluatingSubmission] });

    expect(wrapper.find('.spinner').exists()).toBe(true);
  });

  it('should show outcome icon for evaluated submissions', () => {
    const evaluatedSubmission = {
      ...mockSubmissions[0],
      status: 'EVALUATED',
      result: {
        outcome: 'PASSED',
      },
    };
    wrapper = createWrapper({ submissions: [evaluatedSubmission] });

    expect(wrapper.text()).toContain('✔');
    expect(wrapper.text()).toContain('Passed');
  });

  it('should show failed outcome for failed submissions', () => {
    const failedSubmission = {
      ...mockSubmissions[0],
      status: 'EVALUATED',
      result: {
        outcome: 'FAILED',
      },
    };
    wrapper = createWrapper({ submissions: [failedSubmission] });

    expect(wrapper.text()).toContain('✖');
    expect(wrapper.text()).toContain('Failed');
  });

  it('should render selected submission code in Monaco editor', () => {
    const selectedSubmission = {
      ...mockSubmissions[0],
      solution: 'def solution():\n    return True',
      id: mockSubmissions[0].id,
    };
    wrapper = createWrapper({
      submissions: mockSubmissions,
      selected: selectedSubmission,
    });

    const editor = wrapper.findComponent({ name: 'MonacoCodeEditor' });
    expect(editor.exists()).toBe(true);
    expect(editor.props('readOnly')).toBe(true);
    expect(editor.props('language')).toBe('PYTHON');
    expect(editor.props('modelValue')).toBe('def solution():\n    return True');
  });

  it('should display AI evaluation when available', async () => {
    const selectedSubmission = {
      ...mockSubmissions[0],
      id: mockSubmissions[0].id,
      result: {
        ai_evaluation: 'This solution is correct',
      },
    };
    wrapper = createWrapper({
      submissions: mockSubmissions,
      selected: selectedSubmission,
    });

    await nextTick();
    expect(wrapper.text()).toContain('AI Evaluation');
  });

  it('should display output when available', () => {
    const selectedSubmission = {
      ...mockSubmissions[0],
      id: mockSubmissions[0].id,
      result: {
        output: 'Test output',
      },
    };
    wrapper = createWrapper({
      submissions: mockSubmissions,
      selected: selectedSubmission,
    });

    expect(wrapper.text()).toContain('Output');
    expect(wrapper.text()).toContain('Test output');
  });

  it('should show loading more spinner when loading more', () => {
    wrapper = createWrapper({
      submissions: mockSubmissions,
      loadingMore: true,
    });

    const spinners = wrapper.findAll('.spinner');
    expect(spinners.length).toBeGreaterThan(0);
  });

  it('should emit load-more when intersection observer triggers', async () => {
    wrapper = createWrapper({
      submissions: mockSubmissions.slice(0, 1),
      hasNext: true,
      loading: false,
      loadingMore: false,
    });

    await nextTick();

    if (global.IntersectionObserver.mock.calls.length > 0) {
      const observerCallback = global.IntersectionObserver.mock.calls[0][0];
      const mockEntry = {
        isIntersecting: true,
        target: {},
      };

      observerCallback([mockEntry]);
      await nextTick();

      expect(wrapper.emitted('load-more')).toBeTruthy();
    }

    await vi.advanceTimersByTime(300);
    wrapper.unmount();
  });

  it('should not emit load-more when already loading', async () => {
    wrapper = createWrapper({
      submissions: mockSubmissions.slice(0, 1),
      hasNext: true,
      loading: true,
      loadingMore: false,
    });

    await nextTick();

    if (global.IntersectionObserver.mock.calls.length > 0) {
      const observerCallback = global.IntersectionObserver.mock.calls[0][0];
      const mockEntry = {
        isIntersecting: true,
        target: {},
      };

      observerCallback([mockEntry]);
      await nextTick();

      expect(wrapper.emitted('load-more')).toBeFalsy();
    }

    await vi.advanceTimersByTime(300);
    wrapper.unmount();
  });

  it('should not emit load-more when no more items', async () => {
    wrapper = createWrapper({
      submissions: mockSubmissions.slice(0, 1),
      hasNext: false,
      loading: false,
      loadingMore: false,
    });

    await nextTick();
    await vi.advanceTimersByTime(300);

    if (global.IntersectionObserver.mock.calls.length > 0) {
      const observerCallback = global.IntersectionObserver.mock.calls[0][0];
      const mockEntry = {
        isIntersecting: true,
        target: {},
      };

      observerCallback([mockEntry]);
      await nextTick();

      expect(wrapper.emitted('load-more')).toBeFalsy();
    }

    wrapper.unmount();
  });

  it('should sanitize AI evaluation HTML', async () => {
    const marked = await import('marked');
    const DOMPurify = await import('dompurify');

    const selectedSubmission = {
      ...mockSubmissions[0],
      id: mockSubmissions[0].id,
      result: {
        ai_evaluation: '**Bold text**',
      },
    };
    wrapper = createWrapper({
      submissions: mockSubmissions,
      selected: selectedSubmission,
    });

    await nextTick();

    expect(marked.marked.parse).toHaveBeenCalledWith('**Bold text**');
    expect(DOMPurify.default.sanitize).toHaveBeenCalled();
  });

  it('should handle date formatting errors gracefully', () => {
    const invalidDateSubmission = {
      ...mockSubmissions[0],
      created_at: 'invalid-date',
    };
    wrapper = createWrapper({ submissions: [invalidDateSubmission] });

    expect(wrapper.text()).toContain('Invalid Date');
  });

  it('should use problem language for Monaco editor', () => {
    const javaProblem = { ...mockProblem, language: 'JAVA' };
    const selectedSubmission = {
      ...mockSubmissions[0],
      solution: 'public class Solution {}',
      id: mockSubmissions[0].id,
    };
    wrapper = createWrapper({
      submissions: mockSubmissions,
      selected: selectedSubmission,
      problem: javaProblem,
    });

    const editor = wrapper.findComponent({ name: 'MonacoCodeEditor' });
    expect(editor.props('language')).toBe('JAVA');
  });

  it('should cleanup intersection observer on unmount', async () => {
    wrapper = createWrapper({
      submissions: mockSubmissions.slice(0, 1),
      hasNext: false,
    });

    await nextTick();
    await vi.advanceTimersByTime(300);

    wrapper.unmount();
    await nextTick();

    expect(mockIntersectionObserver.disconnect).toHaveBeenCalled();
  });
});
