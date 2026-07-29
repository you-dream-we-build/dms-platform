import { useState } from 'react';
import toast from 'react-hot-toast';
import { uploadApi } from '../api/upload.api';

// Keep in sync with apps/api/src/modules/upload/upload.constants.ts
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME = /^image\/(jpe?g|png|gif|webp)$/;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  /**
   * Show a local preview and upload in one step, resolving to the stored URL.
   * Selecting and uploading are deliberately not separate: a preview without an
   * uploaded URL looks saved but submits nothing.
   */
  const selectAndUpload = async (file: File): Promise<string | null> => {
    if (!ALLOWED_IMAGE_MIME.test(file.type)) {
      toast.error('Choose a JPG, PNG, GIF or WEBP image');
      return null;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('Image must be 5 MB or smaller');
      return null;
    }

    setPreview(await readAsDataUrl(file));
    setUploading(true);
    try {
      const res = await uploadApi.uploadImage(file);
      const url: string = res.data?.data?.url ?? res.data?.url ?? '';
      if (!url) throw new Error('No URL returned');
      return url;
    } catch {
      toast.error('Image upload failed');
      setPreview(null);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const reset = () => setPreview(null);

  return { selectAndUpload, uploading, preview, reset };
}
