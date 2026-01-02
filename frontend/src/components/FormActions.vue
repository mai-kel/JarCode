<template>
  <div class="flex flex-column align-items-stretch">
    <div v-if="showDelete" class="mb-2">
      <Button
        type="button"
        :label="deleteLabel"
        icon="pi pi-trash"
        class="p-button-danger p-button-text"
        style="width: auto"
        @click="$emit('delete')"
      />
    </div>

    <div>
      <Button
        type="submit"
        :label="saveLabel"
        icon="pi pi-save"
        :loading="isLoading"
        :disabled="!isDirty"
        :class="saveButtonClass"
        style="width: 100%"
        @click="$emit('save')"
      />
    </div>
  </div>
</template>

<script setup>
import Button from 'primevue/button';

defineProps({
  isDirty: {
    type: Boolean,
    default: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  saveLabel: {
    type: String,
    default: 'Save',
  },
  deleteLabel: {
    type: String,
    default: 'Delete',
  },
  showDelete: {
    type: Boolean,
    default: false,
  },
  saveButtonClass: {
    type: String,
    default: '',
  },
});

defineEmits(['save', 'delete']);
</script>
