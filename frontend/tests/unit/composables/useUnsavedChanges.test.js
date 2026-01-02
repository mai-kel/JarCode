import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, ref } from 'vue';
import { useUnsavedChanges } from '../../../src/composables/useUnsavedChanges';

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');
  return {
    ...actual,
    onBeforeRouteLeave: vi.fn((callback) => {
      window.__routeLeaveCallback = callback;
    })
  };
});
const mockConfirm = {
  require: vi.fn()
};

vi.mock('primevue/useconfirm', () => ({
  useConfirm: () => mockConfirm
}));

describe('useUnsavedChanges', () => {
  beforeEach(() => {
    mockConfirm.require.mockClear();
    window.__routeLeaveCallback = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const createTestComponent = (isDirty, options = {}) => {
    return defineComponent({
      setup() {
        useUnsavedChanges(isDirty, options);
        return {};
      },
      template: '<div></div>'
    });
  };

  it('should not show confirmation when not dirty', () => {
    const isDirty = ref(false);
    mount(createTestComponent(isDirty));

    const callback = window.__routeLeaveCallback;
    expect(callback).toBeDefined();

    const next = vi.fn();
    callback({}, {}, next);

    expect(next).toHaveBeenCalled();
    expect(mockConfirm.require).not.toHaveBeenCalled();
  });

  it('should show confirmation when dirty', () => {
    const isDirty = ref(true);
    mount(createTestComponent(isDirty));

    const callback = window.__routeLeaveCallback;
    const next = vi.fn();
    callback({}, {}, next);

    expect(mockConfirm.require).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('should use custom header and message', () => {
    const isDirty = ref(true);
    mount(createTestComponent(isDirty, {
      confirmHeader: 'Custom Header',
      confirmMessage: 'Custom Message'
    }));

    const callback = window.__routeLeaveCallback;
    const next = vi.fn();
    callback({}, {}, next);

    expect(mockConfirm.require).toHaveBeenCalledWith(
      expect.objectContaining({
        header: 'Custom Header',
        message: 'Custom Message'
      })
    );
  });

  it('should call next(true) on accept', () => {
    const isDirty = ref(true);
    mount(createTestComponent(isDirty));

    const callback = window.__routeLeaveCallback;
    const next = vi.fn();
    callback({}, {}, next);

    const callArgs = mockConfirm.require.mock.calls[0][0];
    callArgs.accept();

    expect(next).toHaveBeenCalled();
  });

  it('should call next(false) on reject', () => {
    const isDirty = ref(true);
    mount(createTestComponent(isDirty));

    const callback = window.__routeLeaveCallback;
    const next = vi.fn();
    callback({}, {}, next);

    const callArgs = mockConfirm.require.mock.calls[0][0];
    callArgs.reject();

    expect(next).toHaveBeenCalledWith(false);
  });

  it('should handle function-based isDirty', () => {
    const isDirty = () => true;
    mount(createTestComponent(isDirty));

    const callback = window.__routeLeaveCallback;
    const next = vi.fn();
    callback({}, {}, next);

    expect(mockConfirm.require).toHaveBeenCalled();
  });

  it('should add beforeunload listener when enabled', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const isDirty = ref(true);

    mount(createTestComponent(isDirty, { enableBeforeUnload: true }));

    expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  it('should not add beforeunload listener when disabled', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const isDirty = ref(true);

    mount(createTestComponent(isDirty, { enableBeforeUnload: false }));

    expect(addEventListenerSpy).not.toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  it('should prevent default on beforeunload when dirty', () => {
    const isDirty = ref(true);
    mount(createTestComponent(isDirty, { enableBeforeUnload: true }));

    const beforeUnloadHandler = window.addEventListener.mock.calls
      .find(call => call[0] === 'beforeunload')?.[1];

    expect(beforeUnloadHandler).toBeDefined();

    const event = { preventDefault: vi.fn(), returnValue: '' };
    beforeUnloadHandler(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.returnValue).toBe('');
  });

  it('should not prevent default on beforeunload when not dirty', () => {
    const isDirty = ref(false);
    mount(createTestComponent(isDirty, { enableBeforeUnload: true }));

    const beforeUnloadHandler = window.addEventListener.mock.calls
      .find(call => call[0] === 'beforeunload')?.[1];

    const event = { preventDefault: vi.fn(), returnValue: '' };
    beforeUnloadHandler(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});

