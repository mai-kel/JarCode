import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { useDeleteConfirmation } from '../../../src/composables/useDeleteConfirmation';
const mockConfirm = {
  require: vi.fn(),
};

const mockToast = {
  add: vi.fn(),
};

const mockRouter = {
  push: vi.fn(),
};

vi.mock('primevue/useconfirm', () => ({
  useConfirm: () => mockConfirm,
}));

vi.mock('primevue/usetoast', () => ({
  useToast: () => mockToast,
}));

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');
  return {
    ...actual,
    useRouter: () => mockRouter,
  };
});

describe('useDeleteConfirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createTestComponent = (options) => {
    return defineComponent({
      setup() {
        const confirmDelete = useDeleteConfirmation(options);
        return { confirmDelete };
      },
      template: '<div></div>',
    });
  };

  it('should show confirmation dialog', () => {
    const onConfirm = vi.fn().mockResolvedValue(true);
    const wrapper = mount(
      createTestComponent({
        header: 'Delete Item',
        message: 'Are you sure?',
        onConfirm,
      })
    );

    wrapper.vm.confirmDelete();

    expect(mockConfirm.require).toHaveBeenCalledWith(
      expect.objectContaining({
        header: 'Delete Item',
        message: 'Are you sure?',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Delete',
        rejectLabel: 'Cancel',
        acceptClass: 'p-button-danger',
      })
    );
  });

  it('should call onConfirm on accept', async () => {
    const onConfirm = vi.fn().mockResolvedValue(true);
    const wrapper = mount(
      createTestComponent({
        header: 'Delete',
        message: 'Confirm?',
        onConfirm,
      })
    );

    wrapper.vm.confirmDelete();

    const acceptCallback = mockConfirm.require.mock.calls[0][0].accept;
    await acceptCallback();

    expect(onConfirm).toHaveBeenCalled();
  });

  it('should show success toast on successful deletion', async () => {
    const onConfirm = vi.fn().mockResolvedValue(true);
    const wrapper = mount(
      createTestComponent({
        header: 'Delete',
        message: 'Confirm?',
        onConfirm,
        successMessage: 'Deleted successfully',
      })
    );

    wrapper.vm.confirmDelete();

    const acceptCallback = mockConfirm.require.mock.calls[0][0].accept;
    await acceptCallback();

    expect(mockToast.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Deleted successfully',
      life: 2000,
    });
  });

  it('should navigate to success route on successful deletion', async () => {
    const onConfirm = vi.fn().mockResolvedValue(true);
    const wrapper = mount(
      createTestComponent({
        header: 'Delete',
        message: 'Confirm?',
        onConfirm,
        successRoute: 'home',
      })
    );

    wrapper.vm.confirmDelete();

    const acceptCallback = mockConfirm.require.mock.calls[0][0].accept;
    await acceptCallback();

    expect(mockRouter.push).toHaveBeenCalledWith({ name: 'home' });
  });

  it('should handle object result with ok property', async () => {
    const onConfirm = vi.fn().mockResolvedValue({ ok: true });
    const wrapper = mount(
      createTestComponent({
        header: 'Delete',
        message: 'Confirm?',
        onConfirm,
        successMessage: 'Success',
      })
    );

    wrapper.vm.confirmDelete();

    const acceptCallback = mockConfirm.require.mock.calls[0][0].accept;
    await acceptCallback();

    expect(mockToast.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('should show error toast on failed deletion', async () => {
    const onConfirm = vi.fn().mockResolvedValue(false);
    const wrapper = mount(
      createTestComponent({
        header: 'Delete',
        message: 'Confirm?',
        onConfirm,
        errorMessage: 'Deletion failed',
      })
    );

    wrapper.vm.confirmDelete();

    const acceptCallback = mockConfirm.require.mock.calls[0][0].accept;
    await acceptCallback();

    expect(mockToast.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Deletion failed',
      life: 4000,
    });
  });

  it('should call onError callback on failure', async () => {
    const onConfirm = vi.fn().mockResolvedValue(false);
    const onError = vi.fn();
    const wrapper = mount(
      createTestComponent({
        header: 'Delete',
        message: 'Confirm?',
        onConfirm,
        onError,
      })
    );

    wrapper.vm.confirmDelete();

    const acceptCallback = mockConfirm.require.mock.calls[0][0].accept;
    await acceptCallback();

    expect(onError).toHaveBeenCalled();
  });

  it('should call onSuccess callback on success', async () => {
    const onConfirm = vi.fn().mockResolvedValue(true);
    const onSuccess = vi.fn();
    const wrapper = mount(
      createTestComponent({
        header: 'Delete',
        message: 'Confirm?',
        onConfirm,
        onSuccess,
      })
    );

    wrapper.vm.confirmDelete();

    const acceptCallback = mockConfirm.require.mock.calls[0][0].accept;
    await acceptCallback();

    expect(onSuccess).toHaveBeenCalled();
  });

  it('should handle errors thrown in onConfirm', async () => {
    const error = new Error('Network error');
    const onConfirm = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();
    const wrapper = mount(
      createTestComponent({
        header: 'Delete',
        message: 'Confirm?',
        onConfirm,
        onError,
        errorMessage: 'Error occurred',
      })
    );

    wrapper.vm.confirmDelete();

    const acceptCallback = mockConfirm.require.mock.calls[0][0].accept;
    await acceptCallback();

    expect(onError).toHaveBeenCalledWith(error);
    expect(mockToast.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
  });

  it('should handle route object for successRoute', async () => {
    const onConfirm = vi.fn().mockResolvedValue(true);
    const wrapper = mount(
      createTestComponent({
        header: 'Delete',
        message: 'Confirm?',
        onConfirm,
        successRoute: { name: 'home', params: { id: 1 } },
      })
    );

    wrapper.vm.confirmDelete();

    const acceptCallback = mockConfirm.require.mock.calls[0][0].accept;
    await acceptCallback();

    expect(mockRouter.push).toHaveBeenCalledWith({
      name: 'home',
      params: { id: 1 },
    });
  });
});
