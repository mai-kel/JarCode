import apiClient from './api';

/**
 * Upload image for a lesson
 * @param {number} lessonId - Lesson ID
 * @param {Blob} imageBlob - Image blob
 * @param {string} filename - Image filename
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<string>} Image location URL
 */
export async function uploadLessonImage(lessonId, imageBlob, filename, onProgress) {
  const form = new FormData();
  form.append('image', imageBlob, filename);
  form.append('lesson', lessonId);

  const response = await apiClient.post('/lessons/upload-image/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress((e.loaded / e.total) * 100);
      }
    }
  });

  if (response?.data?.location) {
    return response.data.location;
  }

  throw new Error('No location returned from server');
}

export default {
  uploadLessonImage
};

