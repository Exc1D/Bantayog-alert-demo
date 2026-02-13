import imageCompression from 'browser-image-compression';
import { IMAGE_COMPRESSION_OPTIONS } from './constants';

export async function compressImage(file) {
  try {
    const compressed = await imageCompression(file, IMAGE_COMPRESSION_OPTIONS);
    return compressed;
  } catch (error) {
    console.error('Image compression failed:', error);
    return file;
  }
}

export async function compressMultipleImages(files) {
  const compressed = await Promise.all(
    Array.from(files).map(file => compressImage(file))
  );
  return compressed;
}

export function createThumbnail(file) {
  return imageCompression(file, {
    maxSizeMB: 0.1,
    maxWidthOrHeight: 300,
    useWebWorker: true
  });
}

export function validateImage(file) {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  const maxSize = 10 * 1024 * 1024; // 10MB before compression

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid image type. Use JPEG, PNG, or WebP.' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Image too large. Maximum 10MB.' };
  }

  return { valid: true, error: null };
}
