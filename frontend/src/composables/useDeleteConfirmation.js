import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';

/**
 * Composable for handling delete confirmation dialogs
 * @param {Object} options - Configuration options
 * @param {string} options.header - Header text for confirmation dialog
 * @param {string} options.message - Message text for confirmation dialog
 * @param {Function} options.onConfirm - Async function to execute on confirm (should return boolean or {ok: boolean})
 * @param {Function} [options.onSuccess] - Callback function on successful deletion
 * @param {Function} [options.onError] - Callback function on deletion error
 * @param {string|Object} [options.successRoute] - Route to navigate to on success (name or route object)
 * @param {string} [options.successMessage] - Success toast message
 * @param {string} [options.errorMessage] - Error toast message
 * @returns {Function} confirmDelete function
 */
export function useDeleteConfirmation(options) {
  const {
    header,
    message,
    onConfirm,
    onSuccess,
    onError,
    successRoute,
    successMessage,
    errorMessage
  } = options;

  const confirm = useConfirm();
  const toast = useToast();
  const router = useRouter();

  const confirmDelete = () => {
    confirm.require({
      header,
      message,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptClass: 'p-button-danger',
      accept: async () => {
        try {
          const result = await onConfirm();
          const success = typeof result === 'object' ? result.ok : result;

          if (success) {
            if (successMessage) {
              toast.add({ severity: 'success', summary: successMessage, life: 2000 });
            }
            if (successRoute) {
              router.push(typeof successRoute === 'string' ? { name: successRoute } : successRoute);
            }
            if (onSuccess) {
              onSuccess();
            }
          } else {
            if (errorMessage) {
              toast.add({ severity: 'error', summary: errorMessage, life: 4000 });
            }
            if (onError) {
              onError(result);
            }
          }
        } catch (err) {
          if (errorMessage) {
            toast.add({ severity: 'error', summary: errorMessage, life: 4000 });
          }
          if (onError) {
            onError(err);
          }
        }
      }
    });
  };

  return confirmDelete;
}

