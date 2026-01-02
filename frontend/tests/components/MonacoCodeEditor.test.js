import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import MonacoCodeEditor from '../../src/components/editors/MonacoCodeEditor.vue';

const mockMonacoEditor = {
  getValue: vi.fn(() => ''),
  setValue: vi.fn(),
  getModel: vi.fn(() => ({})),
  updateOptions: vi.fn(),
  dispose: vi.fn(),
  onDidChangeModelContent: vi.fn((callback) => {
    mockMonacoEditor._onChangeCallback = callback;
    return { dispose: vi.fn() };
  })
};

const mockMonacoApi = {
  editor: {
    create: vi.fn(() => mockMonacoEditor),
    setModelLanguage: vi.fn()
  }
};

vi.mock('@monaco-editor/loader', () => ({
  default: {
    init: vi.fn(() => Promise.resolve(mockMonacoApi))
  }
}));

describe('MonacoCodeEditor', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    mockMonacoEditor.getValue.mockReturnValue('');
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  const createWrapper = (props = {}) => {
    return mount(MonacoCodeEditor, {
      props: {
        modelValue: '',
        language: 'PYTHON',
        readOnly: false,
        height: 600,
        theme: 'vs-dark',
        minimap: false,
        ...props
      },
      global: {
        stubs: {
          ProgressSpinner: {
            template: '<div class="spinner">Loading...</div>'
          }
        }
      }
    });
  };

  it('should render loading spinner initially', () => {
    wrapper = createWrapper();
    expect(wrapper.find('.spinner').exists()).toBe(true);
  });

  it('should initialize Monaco editor on mount', async () => {
    wrapper = createWrapper();
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    const loader = await import('@monaco-editor/loader');
    expect(loader.default.init).toHaveBeenCalled();
  });

  it('should set initial value', async () => {
    wrapper = createWrapper({ modelValue: 'initial code' });
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockMonacoApi.editor.create).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        value: 'initial code'
      })
    );
  });

  it('should use correct language', async () => {
    wrapper = createWrapper({ language: 'JAVA' });
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockMonacoApi.editor.create).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        language: 'java'
      })
    );
  });

  it('should set readOnly option', async () => {
    wrapper = createWrapper({ readOnly: true });
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockMonacoApi.editor.create).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        readOnly: true
      })
    );
  });

  it('should set theme', async () => {
    wrapper = createWrapper({ theme: 'vs-light' });
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockMonacoApi.editor.create).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        theme: 'vs-light'
      })
    );
  });

  it('should set minimap', async () => {
    wrapper = createWrapper({ minimap: true });
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockMonacoApi.editor.create).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        minimap: { enabled: true }
      })
    );
  });

  it('should emit update:modelValue when content changes', async () => {
    wrapper = createWrapper();
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    mockMonacoEditor.getValue.mockReturnValue('new code');
    if (mockMonacoEditor._onChangeCallback) {
      mockMonacoEditor._onChangeCallback();
      await nextTick();

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0][0]).toBe('new code');
    }
  });

  it('should not emit update:modelValue when readOnly', async () => {
    wrapper = createWrapper({ readOnly: true });
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    mockMonacoEditor.getValue.mockReturnValue('new code');
    if (mockMonacoEditor._onChangeCallback) {
      mockMonacoEditor._onChangeCallback();
      await nextTick();

      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    }
  });

  it('should update editor value when prop changes', async () => {
    wrapper = createWrapper({ modelValue: 'initial' });
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    mockMonacoEditor.getValue.mockReturnValue('initial');
    await wrapper.setProps({ modelValue: 'updated' });
    await nextTick();

    expect(mockMonacoEditor.setValue).toHaveBeenCalledWith('updated');
  });

  it('should not update if value matches current editor value', async () => {
    wrapper = createWrapper({ modelValue: 'test' });
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    mockMonacoEditor.getValue.mockReturnValue('test');
    const setValueCalls = mockMonacoEditor.setValue.mock.calls.length;
    await wrapper.setProps({ modelValue: 'test' });
    await nextTick();

    expect(mockMonacoEditor.setValue.mock.calls.length).toBe(setValueCalls);
  });

  it('should update language when prop changes', async () => {
    wrapper = createWrapper({ language: 'PYTHON' });
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    await wrapper.setProps({ language: 'JAVA' });
    await nextTick();

    expect(mockMonacoApi.editor.setModelLanguage).toHaveBeenCalledWith(
      expect.anything(),
      'java'
    );
  });

  it('should update readOnly when prop changes', async () => {
    wrapper = createWrapper({ readOnly: false });
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    await wrapper.setProps({ readOnly: true });
    await nextTick();

    expect(mockMonacoEditor.updateOptions).toHaveBeenCalledWith({
      readOnly: true
    });
  });

  it('should dispose editor on unmount', async () => {
    wrapper = createWrapper();
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    wrapper.unmount();
    await nextTick();

    expect(mockMonacoEditor.dispose).toHaveBeenCalled();
  });

  it('should handle editor initialization error', async () => {
    const loader = await import('@monaco-editor/loader');
    loader.default.init.mockRejectedValueOnce(new Error('Init failed'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    wrapper = createWrapper();
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should use default height', () => {
    wrapper = createWrapper({ height: undefined });
    expect(wrapper.vm.$el.style.height).toBe('600px');
  });

  it('should use custom height', () => {
    wrapper = createWrapper({ height: 800 });
    expect(wrapper.vm.$el.style.height).toBe('800px');
  });
});

