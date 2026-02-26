import { useRef, useState } from 'react';
import { validateMedia } from '../../utils/imageCompression';
import { useToast } from '../Common/Toast';
import { MAX_EVIDENCE } from '../../utils/constants';

export default function EvidenceCapture({ files, onFilesChange }) {
  const { addToast } = useToast();
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleFiles = (e) => {
    const incoming = Array.from(e.target.files);
    if (!incoming.length) return;

    if (files.length + incoming.length > MAX_EVIDENCE) {
      addToast(`Maximum ${MAX_EVIDENCE} files allowed`, 'warning');
      return;
    }

    const valid = [];
    for (const file of incoming) {
      const result = validateMedia(file);
      if (!result.valid) {
        addToast(result.error, 'error');
        continue;
      }
      valid.push(file);
    }

    if (valid.length) {
      onFilesChange([...files, ...valid]);
      const newPreviews = valid.map((f) => ({
        url: URL.createObjectURL(f),
        type: f.type.startsWith('video/') ? 'video' : 'image',
      }));
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }

    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleRemove = (index) => {
    URL.revokeObjectURL(previewUrls[index].url);
    onFilesChange(files.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-textLight text-center">Provide evidence of the incident</p>

      {/* Source buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-stone-200 bg-white hover:border-accent/50 hover:bg-accent/5 transition-all active:scale-[0.98]"
        >
          <svg
            aria-hidden="true"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-stone-500"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span className="text-sm font-semibold text-stone-700">Camera</span>
        </button>

        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-stone-200 bg-white hover:border-accent/50 hover:bg-accent/5 transition-all active:scale-[0.98]"
        >
          <svg
            aria-hidden="true"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-stone-500"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span className="text-sm font-semibold text-stone-700">Gallery</span>
        </button>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFiles}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      {/* Preview grid */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previewUrls.map((preview, i) => (
            <div key={i} className="relative group">
              {preview.type === 'video' ? (
                <video
                  src={preview.url}
                  className="w-full h-20 object-cover rounded-lg border border-stone-200"
                  muted
                />
              ) : (
                <img
                  src={preview.url}
                  alt={`Evidence ${i + 1}`}
                  className="w-full h-20 object-cover rounded-lg border border-stone-200"
                />
              )}
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
              >
                &times;
              </button>
              {preview.type === 'video' && (
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                  Video
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-textLight text-center">
        {files.length}/{MAX_EVIDENCE} files added &mdash; photos or short videos
      </p>
    </div>
  );
}
