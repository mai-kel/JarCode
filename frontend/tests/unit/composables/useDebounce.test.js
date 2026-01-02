import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { useDebounce } from '../../../src/composables/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createTestComponent = (callback, delay = 300) => {
    return defineComponent({
      setup() {
        const { debouncedFunction, cancel } = useDebounce(callback, delay);
        return { debouncedFunction, cancel };
      },
      template: '<div></div>'
    });
  };

  it('should debounce function calls', () => {
    const callback = vi.fn();
    const wrapper = mount(createTestComponent(callback, 300));

    wrapper.vm.debouncedFunction();
    wrapper.vm.debouncedFunction();
    wrapper.vm.debouncedFunction();

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should use custom delay', () => {
    const callback = vi.fn();
    const wrapper = mount(createTestComponent(callback, 500));

    wrapper.vm.debouncedFunction();
    vi.advanceTimersByTime(300);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to callback', () => {
    const callback = vi.fn();
    const wrapper = mount(createTestComponent(callback, 300));

    wrapper.vm.debouncedFunction('arg1', 'arg2');
    vi.advanceTimersByTime(300);

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should cancel pending debounce', () => {
    const callback = vi.fn();
    const wrapper = mount(createTestComponent(callback, 300));

    wrapper.vm.debouncedFunction();
    wrapper.vm.cancel();
    vi.advanceTimersByTime(300);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should reset timeout on new call', () => {
    const callback = vi.fn();
    const wrapper = mount(createTestComponent(callback, 300));

    wrapper.vm.debouncedFunction();
    vi.advanceTimersByTime(200);

    wrapper.vm.debouncedFunction();
    vi.advanceTimersByTime(200);

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should cancel on unmount', () => {
    const callback = vi.fn();
    const wrapper = mount(createTestComponent(callback, 300));

    wrapper.vm.debouncedFunction();
    wrapper.unmount();
    vi.advanceTimersByTime(300);

    expect(callback).not.toHaveBeenCalled();
  });
});

