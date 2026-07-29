import api from './axios';

/**
 * Entity-agnostic image upload. Returns the stored image's public URL, which
 * callers save onto whichever field they're editing (student/donor images).
 */
export const uploadApi = {
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
