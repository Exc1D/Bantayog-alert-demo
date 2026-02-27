import imageCompression from 'browser-image-compression';
import { IMAGE_COMPRESSION_OPTIONS } from './constants';
import { captureException } from './sentry';

export async function compressImage(file) {
  try {
    const compressed = await imageCompression(file, IMAGE_COMPRESSION_OPTIONS);
    return compressed;
  } catch (error) {
    captureException(error, { tags: { component: 'imageCompression' } });
    return file;
  }
}

export async function compressMultipleImages(files) {
  const compressed = await Promise.all(Array.from(files).map((file) => compressImage(file)));
  return compressed;
}

export async function createThumbnail(file) {
  try {
    return await imageCompression(file, {
      maxSizeMB: 0.1,
      maxWidthOrHeight: 300,
      useWebWorker: true,
    });
  } catch (error) {
    captureException(error, { tags: { component: 'createThumbnail' } });
    return file;
  }
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

export function validateMedia(file) {
  const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  const validVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm'];

  const isImage = validImageTypes.includes(file.type);
  const isVideo = validVideoTypes.includes(file.type);

  if (!isImage && !isVideo) {
    return {
      valid: false,
      error: 'Unsupported file type. Use JPEG, PNG, WebP, MP4, MOV, or WebM.',
    };
  }

  if (isImage && file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'Image too large. Maximum 10MB.' };
  }

  if (isVideo && file.size > 50 * 1024 * 1024) {
    return { valid: false, error: 'Video too large. Maximum 50MB.' };
  }

  return { valid: true, error: null };
}
