import { useState } from 'react';
import { validateImage } from '../../utils/imageCompression';
import { useToast } from '../Common/Toast';

export default function EvidenceUpload({ photos, onPhotosChange, maxPhotos = 5 }) {
  const { addToast } = useToast();
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleAdd = (e) => {
    const files = Array.from(e.target.files);

    if (photos.length + files.length > maxPhotos) {
      addToast(`Maximum ${maxPhotos} evidence photos`, 'warning');
      return;
    }

    const validFiles = [];
    for (const file of files) {
      const validation = validateImage(file);
      if (!validation.valid) {
        addToast(validation.error, 'error');
        continue;
      }
      validFiles.push(file);
    }

    onPhotosChange([...photos, ...validFiles]);
    const newPreviews = validFiles.map(f => URL.createObjectURL(f));
    setPreviewUrls(prev => [...prev, ...newPreviews]);
  };

  const handleRemove = (index) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-bold mb-1.5">
        Resolution Evidence Photos (Required) <span className="text-danger">*</span>
      </label>
      <p className="text-xs text-textLight mb-2">
        Upload 1-{maxPhotos} photos showing the issue has been resolved
      </p>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleAdd}
        className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
      />

      {previewUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {previewUrls.map((url, i) => (
            <div key={i} className="relative">
              <img
                src={url}
                alt={`Evidence ${i + 1}`}
                className="w-full h-20 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
