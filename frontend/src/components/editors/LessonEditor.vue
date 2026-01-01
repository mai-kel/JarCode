<template>
  <Editor :id="editorId" v-model="localValue" :init="editorConfig" />
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import Editor from '@tinymce/tinymce-vue';
import '../../utils/tinymceImports';
import 'tinymce/plugins/image';
import 'tinymce/plugins/media';
import { createTinyMCEConfig } from '../../utils/tinymceConfig';
import { useCourseStore } from '../../store/course';
import { getErrorMessage } from '../../utils/errorHandler';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  lessonId: {
    type: [String, Number],
    default: null
  },
  height: {
    type: Number,
    default: 700
  },
  editorId: {
    type: String,
    default: 'lessonContent'
  }
});

const emit = defineEmits(['update:modelValue']);

const courseStore = useCourseStore();
const localValue = ref(props.modelValue);

const editorConfig = computed(() => {
  const hasImageUpload = !!props.lessonId;

  return createTinyMCEConfig({
    height: props.height,
    enableImageUpload: hasImageUpload,
    imageUploadHandler: hasImageUpload ? async (blobInfo, success, failure, progress) => {
      try {
        const location = await courseStore.uploadLessonImage(
          props.lessonId,
          blobInfo.blob(),
          blobInfo.filename(),
          (percent) => {
            if (progress) {
              progress(percent);
            }
          }
        );
        success(location);
      } catch (err) {
        failure(getErrorMessage(err) || 'Failed to upload image');
      }
    } : null
  });
});

watch(() => props.modelValue, (newVal) => {
  if (newVal !== localValue.value) {
    localValue.value = newVal;
  }
});

watch(localValue, (newVal) => {
  emit('update:modelValue', newVal);
});
</script>

