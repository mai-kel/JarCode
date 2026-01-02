import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import LessonEditor from '../../src/components/editors/LessonEditor.vue';
import { useCourseStore } from '../../src/store/course';

vi.mock('../../src/store/course', () => ({
  useCourseStore: vi.fn(),
}));

vi.mock('../../src/utils/tinymceImports', () => ({}));
vi.mock('tinymce/plugins/image', () => ({}));
vi.mock('tinymce/plugins/media', () => ({}));

vi.mock('@tinymce/tinymce-vue', () => ({
  default: {
    name: 'Editor',
    template:
      '<div class="tinymce-editor-mock"><textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /></div>',
    props: ['id', 'modelValue', 'init'],
    emits: ['update:modelValue'],
  },
}));

describe('LessonEditor', () => {
  let wrapper;
  let mockCourseStore;

  beforeEach(() => {
    mockCourseStore = {
      uploadLessonImage: vi.fn(),
    };
    useCourseStore.mockReturnValue(mockCourseStore);
    vi.clearAllMocks();
  });

  const createWrapper = (props = {}) => {
    return mount(LessonEditor, {
      props: {
        modelValue: '',
        lessonId: null,
        height: 700,
        editorId: 'lessonContent',
        ...props,
      },
    });
  };

  it('should render TinyMCE editor', () => {
    wrapper = createWrapper();
    expect(wrapper.find('.tinymce-editor-mock').exists()).toBe(true);
  });

  it('should initialize with prop value', () => {
    wrapper = createWrapper({ modelValue: 'Initial content' });
    const editor = wrapper.findComponent({ name: 'Editor' });
    expect(editor.props('modelValue')).toBe('Initial content');
  });

  it('should use default editorId when not provided', () => {
    wrapper = createWrapper({ editorId: undefined });
    const editor = wrapper.findComponent({ name: 'Editor' });
    expect(editor.props('id')).toBe('lessonContent');
  });

  it('should use custom editorId when provided', () => {
    wrapper = createWrapper({ editorId: 'custom-editor' });
    const editor = wrapper.findComponent({ name: 'Editor' });
    expect(editor.props('id')).toBe('custom-editor');
  });

  it('should use default height when not provided', () => {
    wrapper = createWrapper({ height: undefined });
    const editor = wrapper.findComponent({ name: 'Editor' });
    expect(editor.props('init').height).toBe(700);
  });

  it('should use custom height when provided', () => {
    wrapper = createWrapper({ height: 800 });
    const editor = wrapper.findComponent({ name: 'Editor' });
    expect(editor.props('init').height).toBe(800);
  });

  it('should enable image upload when lessonId is provided', () => {
    wrapper = createWrapper({ lessonId: 1 });
    const editorConfig = wrapper.vm.editorConfig;
    expect(editorConfig.plugins).toContain('image');
    expect(editorConfig.images_upload_handler).toBeDefined();
    expect(editorConfig.automatic_uploads).toBe(true);
  });

  it('should disable image upload when lessonId is null', () => {
    wrapper = createWrapper({ lessonId: null });
    const editorConfig = wrapper.vm.editorConfig;
    expect(editorConfig.plugins).not.toContain('image');
    expect(editorConfig.images_upload_handler).toBeUndefined();
  });

  it('should emit update:modelValue when editor content changes', async () => {
    wrapper = createWrapper();
    const editor = wrapper.findComponent({ name: 'Editor' });
    const textarea = editor.find('textarea');

    await textarea.setValue('New content');
    await textarea.trigger('input');
    await nextTick();

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0][0]).toBe('New content');
  });

  it('should update local value when prop changes', async () => {
    wrapper = createWrapper({ modelValue: 'Initial' });
    await wrapper.setProps({ modelValue: 'Updated' });
    await nextTick();

    const editor = wrapper.findComponent({ name: 'Editor' });
    expect(editor.props('modelValue')).toBe('Updated');
  });

  it('should not update if prop value matches local value', async () => {
    wrapper = createWrapper({ modelValue: 'Test' });
    await wrapper.setProps({ modelValue: 'Test' });
    await nextTick();

    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('should call uploadLessonImage when image is uploaded', async () => {
    mockCourseStore.uploadLessonImage.mockResolvedValue('https://example.com/image.jpg');
    wrapper = createWrapper({ lessonId: 1 });
    const editorConfig = wrapper.vm.editorConfig;
    const imageUploadHandler = editorConfig.images_upload_handler;

    const mockBlobInfo = {
      blob: () => new Blob(['test'], { type: 'image/png' }),
      filename: () => 'test.png',
    };

    await imageUploadHandler(mockBlobInfo, vi.fn(), vi.fn(), vi.fn());

    expect(mockCourseStore.uploadLessonImage).toHaveBeenCalledWith(
      1,
      expect.any(Blob),
      'test.png',
      expect.any(Function)
    );
  });

  it('should call success callback on successful image upload', async () => {
    mockCourseStore.uploadLessonImage.mockResolvedValue('https://example.com/image.jpg');
    wrapper = createWrapper({ lessonId: 1 });
    const editorConfig = wrapper.vm.editorConfig;
    const imageUploadHandler = editorConfig.images_upload_handler;

    const success = vi.fn();
    const mockBlobInfo = {
      blob: () => new Blob(['test'], { type: 'image/png' }),
      filename: () => 'test.png',
    };

    await imageUploadHandler(mockBlobInfo, success, vi.fn(), vi.fn());

    expect(success).toHaveBeenCalledWith('https://example.com/image.jpg');
  });

  it('should call failure callback on image upload error', async () => {
    mockCourseStore.uploadLessonImage.mockRejectedValue(new Error('Upload failed'));
    wrapper = createWrapper({ lessonId: 1 });
    const editorConfig = wrapper.vm.editorConfig;
    const imageUploadHandler = editorConfig.images_upload_handler;

    const failure = vi.fn();
    const mockBlobInfo = {
      blob: () => new Blob(['test'], { type: 'image/png' }),
      filename: () => 'test.png',
    };

    await imageUploadHandler(mockBlobInfo, vi.fn(), failure, vi.fn());

    expect(failure).toHaveBeenCalled();
  });

  it('should call progress callback during image upload', async () => {
    mockCourseStore.uploadLessonImage.mockImplementation(async (id, blob, filename, onProgress) => {
      if (onProgress) onProgress(50);
      return 'https://example.com/image.jpg';
    });
    wrapper = createWrapper({ lessonId: 1 });
    const editorConfig = wrapper.vm.editorConfig;
    const imageUploadHandler = editorConfig.images_upload_handler;

    const progress = vi.fn();
    const mockBlobInfo = {
      blob: () => new Blob(['test'], { type: 'image/png' }),
      filename: () => 'test.png',
    };

    await imageUploadHandler(mockBlobInfo, vi.fn(), vi.fn(), progress);

    expect(progress).toHaveBeenCalledWith(50);
  });
});
