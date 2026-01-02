import { onBeforeRouteLeave } from 'vue-router';
import { onBeforeUnmount } from 'vue';
import { useConfirm } from 'primevue/useconfirm';

/**
 * Composable for handling unsaved changes warnings
 * @param {import('vue').ComputedRef<boolean>|import('vue').Ref<boolean>|() => boolean} isDirty - Reactive reference or function that returns true if there are unsaved changes
 * @param {Object} options - Configuration options
 * @param {string} [options.confirmHeader='Unsaved changes'] - Header text for confirmation dialog
 * @param {string} [options.confirmMessage='You have unsaved changes. Leave without saving?'] - Message text for confirmation dialog
 * @param {boolean} [options.enableBeforeUnload=true] - Whether to show browser beforeunload warning
 */
export function useUnsavedChanges(isDirty, options = {}) {
  const {
    confirmHeader = 'Unsaved changes',
    confirmMessage = 'You have unsaved changes. Leave without saving?',
    enableBeforeUnload = true,
  } = options;

  const confirm = useConfirm();

  // Handle route navigation guard
  onBeforeRouteLeave((to, from, next) => {
    const dirty = typeof isDirty === 'function' ? isDirty() : isDirty.value;
    if (!dirty) {
      return next();
    }

    confirm.require({
      header: confirmHeader,
      message: confirmMessage,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Leave',
      rejectLabel: 'Stay',
      acceptClass: 'p-button-danger',
      accept: () => next(),
      reject: () => next(false),
    });
  });

  // Handle browser beforeunload event
  if (enableBeforeUnload) {
    const beforeUnload = (e) => {
      const dirty = typeof isDirty === 'function' ? isDirty() : isDirty.value;
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', beforeUnload);

    onBeforeUnmount(() => {
      window.removeEventListener('beforeunload', beforeUnload);
    });
  }
}
