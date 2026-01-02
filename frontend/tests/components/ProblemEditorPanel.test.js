import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ProblemEditorPanel from '../../src/components/ProblemEditorPanel.vue';
import { mockProblem } from '../../src/test/fixtures/problems.js';

vi.mock('../../src/components/editors/MonacoCodeEditor.vue', () => ({
  default: {
    name: 'MonacoCodeEditor',
    template: '<div class="monaco-editor-mock"><textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /></div>',
    props: ['modelValue', 'language', 'height', 'readOnly'],
    emits: ['update:modelValue']
  }
}));

vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((html) => html)
  }
}));

describe('ProblemEditorPanel', () => {
  let wrapper;

  const createWrapper = (props = {}) => {
    return mount(ProblemEditorPanel, {
      props: {
        problem: mockProblem,
        editorCode: '',
        ...props
      },
      global: {
        stubs: {
          Card: {
            template: '<div class="card"><slot name="title" /><slot name="subtitle" /><slot name="content" /></div>'
          },
          Button: {
            template: '<button :disabled="disabled" :class="{ loading: loading }" @click="$emit(\'click\')"><slot>{{ label }}</slot></button>',
            props: ['disabled', 'loading', 'label']
          },
          ProgressSpinner: {
            template: '<div class="spinner">Loading...</div>'
          }
        }
      }
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading spinner when problem is not provided', () => {
    wrapper = createWrapper({ problem: null });
    expect(wrapper.find('.spinner').exists()).toBe(true);
  });

  it('should render problem description when problem is provided', () => {
    wrapper = createWrapper();
    expect(wrapper.text()).toContain('Test Description');
  });

  it('should display formatted language', () => {
    wrapper = createWrapper();
    expect(wrapper.text()).toContain('Language: Python');
  });

  it('should display formatted difficulty', () => {
    wrapper = createWrapper();
    expect(wrapper.text()).toContain('Difficulty: Easy');
  });

  it('should render Monaco code editor', () => {
    wrapper = createWrapper();
    expect(wrapper.find('.monaco-editor-mock').exists()).toBe(true);
  });

  it('should pass correct language to Monaco editor', () => {
    wrapper = createWrapper();
    const editor = wrapper.findComponent({ name: 'MonacoCodeEditor' });
    expect(editor.props('language')).toBe('PYTHON');
  });

  it('should render submit button', () => {
    wrapper = createWrapper();
    const buttons = wrapper.findAll('button');
    const submitButton = buttons.find(b => b.attributes('label') === 'Submit' || b.text().includes('Submit'));
    expect(submitButton).toBeTruthy();
  });

  it('should emit submit event when submit button is clicked', async () => {
    wrapper = createWrapper();
    wrapper.vm.editorCode = 'def solution():\n    return True';

    const submitButton = wrapper.find('button');
    await submitButton.trigger('click');
    await nextTick();

    expect(wrapper.emitted('submit')).toBeTruthy();
    expect(wrapper.emitted('submit')[0][0]).toEqual({
      solution: 'def solution():\n    return True'
    });
  });

  it('should show loading state on submit button when submitting', async () => {
    wrapper = createWrapper();
    wrapper.vm.isSubmitting = true;
    await nextTick();

    const submitButton = wrapper.find('button');
    expect(submitButton.classes()).toContain('loading');
  });

  it('should display submit error when present', async () => {
    wrapper = createWrapper();
    wrapper.vm.submitError = { message: 'Submission failed' };
    await nextTick();

    expect(wrapper.text()).toContain('Error: Submission failed');
  });

  it('should display submit error as string when error is not an object', async () => {
    wrapper = createWrapper();
    wrapper.vm.submitError = 'Simple error message';
    await nextTick();

    expect(wrapper.text()).toContain('Error: Simple error message');
  });

  it('should sanitize problem description', async () => {
    const DOMPurify = await import('dompurify');
    wrapper = createWrapper();
    await nextTick();
    expect(DOMPurify.default.sanitize).toHaveBeenCalled();
  });

  it('should handle different languages correctly', () => {
    const javaProblem = { ...mockProblem, language: 'JAVA' };
    wrapper = createWrapper({ problem: javaProblem });

    expect(wrapper.text()).toContain('Language: Java');
  });

  it('should handle different difficulties correctly', () => {
    const hardProblem = { ...mockProblem, difficulty: 'HARD' };
    wrapper = createWrapper({ problem: hardProblem });

    expect(wrapper.text()).toContain('Difficulty: Hard');
  });

  it('should update editor code when model value changes', async () => {
    wrapper = createWrapper();
    const editor = wrapper.findComponent({ name: 'MonacoCodeEditor' });
    const textarea = editor.find('textarea');

    await textarea.setValue('new code');
    await textarea.trigger('input');
    await nextTick();

    expect(wrapper.vm.editorCode).toBe('new code');
  });
});
