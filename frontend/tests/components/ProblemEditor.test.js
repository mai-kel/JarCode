import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ProblemEditor from '../../src/components/ProblemEditor.vue';

vi.mock('../../src/utils/tinymceImports', () => ({}));
vi.mock('../../src/components/editors/MonacoCodeEditor.vue', () => ({
  default: {
    name: 'MonacoCodeEditor',
    template: '<div class="monaco-editor-mock"><textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /></div>',
    props: ['modelValue', 'language', 'height'],
    emits: ['update:modelValue']
  }
}));

vi.mock('@tinymce/tinymce-vue', () => ({
  default: {
    name: 'Editor',
    template: '<div class="tinymce-editor-mock"><textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /></div>',
    props: ['id', 'modelValue', 'init'],
    emits: ['update:modelValue']
  }
}));

describe('ProblemEditor', () => {
  let wrapper;

  const createWrapper = (props = {}) => {
    return mount(ProblemEditor, {
      props: {
        description: '',
        startingCode: '',
        testCode: '',
        language: 'PYTHON',
        ...props
      }
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all editor fields', () => {
    wrapper = createWrapper();
    expect(wrapper.find('.tinymce-editor-mock').exists()).toBe(true);
    expect(wrapper.findAll('.monaco-editor-mock').length).toBe(2);
  });

  it('should display description label', () => {
    wrapper = createWrapper();
    expect(wrapper.text()).toContain('Description');
  });

  it('should display starting code label', () => {
    wrapper = createWrapper();
    expect(wrapper.text()).toContain('Starting Code');
  });

  it('should display test code label', () => {
    wrapper = createWrapper();
    expect(wrapper.text()).toContain('Test Code');
  });

  it('should initialize with prop values', () => {
    wrapper = createWrapper({
      description: 'Test description',
      startingCode: 'def solution():',
      testCode: 'assert solution()'
    });

    const editor = wrapper.findComponent({ name: 'Editor' });
    const monacoEditors = wrapper.findAllComponents({ name: 'MonacoCodeEditor' });

    expect(editor.props('modelValue')).toBe('Test description');
    expect(monacoEditors[0].props('modelValue')).toBe('def solution():');
    expect(monacoEditors[1].props('modelValue')).toBe('assert solution()');
  });

  it('should pass language to Monaco editors', () => {
    wrapper = createWrapper({ language: 'JAVA' });
    const monacoEditors = wrapper.findAllComponents({ name: 'MonacoCodeEditor' });

    monacoEditors.forEach(editor => {
      expect(editor.props('language')).toBe('JAVA');
    });
  });

  it('should emit update:description when description changes', async () => {
    wrapper = createWrapper();
    const editor = wrapper.findComponent({ name: 'Editor' });
    const textarea = editor.find('textarea');

    await textarea.setValue('New description');
    await textarea.trigger('input');
    await nextTick();

    expect(wrapper.emitted('update:description')).toBeTruthy();
    expect(wrapper.emitted('update:description')[0][0]).toBe('New description');
  });

  it('should emit update:startingCode when starting code changes', async () => {
    wrapper = createWrapper();
    const monacoEditors = wrapper.findAllComponents({ name: 'MonacoCodeEditor' });
    const startingCodeEditor = monacoEditors[0];
    const textarea = startingCodeEditor.find('textarea');

    await textarea.setValue('def new_solution():');
    await textarea.trigger('input');
    await nextTick();

    expect(wrapper.emitted('update:startingCode')).toBeTruthy();
    expect(wrapper.emitted('update:startingCode')[0][0]).toBe('def new_solution():');
  });

  it('should emit update:testCode when test code changes', async () => {
    wrapper = createWrapper();
    const monacoEditors = wrapper.findAllComponents({ name: 'MonacoCodeEditor' });
    const testCodeEditor = monacoEditors[1];
    const textarea = testCodeEditor.find('textarea');

    await textarea.setValue('assert new_solution()');
    await textarea.trigger('input');
    await nextTick();

    expect(wrapper.emitted('update:testCode')).toBeTruthy();
    expect(wrapper.emitted('update:testCode')[0][0]).toBe('assert new_solution()');
  });

  it('should update local values when props change', async () => {
    wrapper = createWrapper({ description: 'Initial' });
    await wrapper.setProps({ description: 'Updated' });
    await nextTick();

    const editor = wrapper.findComponent({ name: 'Editor' });
    expect(editor.props('modelValue')).toBe('Updated');
  });

  it('should not update if prop value matches local value', async () => {
    wrapper = createWrapper({ description: 'Test' });
    await wrapper.setProps({ description: 'Test' });
    await nextTick();

    expect(wrapper.emitted('update:description')).toBeFalsy();
  });

  it('should pass correct height to Monaco editors', () => {
    wrapper = createWrapper();
    const monacoEditors = wrapper.findAllComponents({ name: 'MonacoCodeEditor' });

    monacoEditors.forEach(editor => {
      expect(editor.props('height')).toBe(600);
    });
  });
});

