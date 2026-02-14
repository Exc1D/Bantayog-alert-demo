import { useState } from 'react';
import { SEVERITY_LEVELS, MAX_PHOTOS } from '../../utils/constants';
import { validateImage } from '../../utils/imageCompression';
import { useToast } from '../Common/Toast';

const SEVERITY_STYLES = {
  critical: {
    active: 'border-red-500 bg-red-50 text-red-800 ring-1 ring-red-200',
    icon: '\u{1F534}'
  },
  moderate: {
    active: 'border-amber-500 bg-amber-50 text-amber-800 ring-1 ring-amber-200',
    icon: '\u{1F7E0}'
  },
  minor: {
    active: 'border-green-500 bg-green-50 text-green-800 ring-1 ring-green-200',
    icon: '\u{1F7E2}'
  }
};

export default function ReportForm({ disasterType, formData, onChange, photos, onPhotosChange }) {
  const { addToast } = useToast();
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleFieldChange = (name, value) => {
    onChange({ ...formData, [name]: value });
  };

  const handlePhotoAdd = (e) => {
    const files = Array.from(e.target.files);

    if (photos.length + files.length > MAX_PHOTOS) {
      addToast(`Maximum ${MAX_PHOTOS} photos allowed`, 'warning');
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

    const newPhotos = [...photos, ...validFiles];
    onPhotosChange(newPhotos);

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviews]);
  };

  const handlePhotoRemove = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);

    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleTagToggle = (tag) => {
    const tags = formData.tags || [];
    if (tags.includes(tag)) {
      handleFieldChange('tags', tags.filter(t => t !== tag));
    } else {
      handleFieldChange('tags', [...tags, tag]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Selected Type Display */}
      <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 flex items-center gap-3">
        <span className="text-2xl">{disasterType.icon}</span>
        <div className="min-w-0">
          <p className="font-bold text-sm">{disasterType.label}</p>
          <p className="text-xs text-textLight truncate">{disasterType.description}</p>
        </div>
      </div>

      {/* Severity */}
      <div>
        <label className="block text-xs font-bold text-textLight uppercase tracking-wider mb-2">
          Severity Level <span className="text-accent">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {SEVERITY_LEVELS.map(level => {
            const style = SEVERITY_STYLES[level];
            return (
              <button
                key={level}
                type="button"
                onClick={() => handleFieldChange('severity', level)}
                className={`p-2.5 rounded-lg border-2 text-sm font-bold capitalize transition-all ${
                  formData.severity === level
                    ? style.active
                    : 'border-stone-200 hover:border-stone-300 text-textLight'
                }`}
              >
                <span className="mr-1">{style.icon}</span> {level}
              </button>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-textLight uppercase tracking-wider mb-2">
          What is happening? <span className="text-accent">*</span>
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder="Describe what you see: location details, severity, and any immediate dangers..."
          className="w-full border border-stone-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent resize-none bg-white"
          rows="3"
          required
        />
      </div>

      {/* Type-specific fields */}
      {disasterType.fields.map(field => (
        <div key={field.name}>
          <label className="block text-xs font-bold text-textLight uppercase tracking-wider mb-2">{field.label}</label>
          {field.type === 'number' && (
            <input
              type="number"
              value={formData[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, Number(e.target.value))}
              min={field.min}
              max={field.max}
              className="w-full border border-stone-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent bg-white"
            />
          )}
          {field.type === 'boolean' && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleFieldChange(field.name, true)}
                className={`flex-1 p-2.5 rounded-lg border text-sm font-semibold transition-all ${
                  formData[field.name] === true
                    ? 'border-accent bg-accent/5 text-accent'
                    : 'border-stone-200 hover:border-stone-300 text-textLight'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleFieldChange(field.name, false)}
                className={`flex-1 p-2.5 rounded-lg border text-sm font-semibold transition-all ${
                  formData[field.name] === false
                    ? 'border-accent bg-accent/5 text-accent'
                    : 'border-stone-200 hover:border-stone-300 text-textLight'
                }`}
              >
                No
              </button>
            </div>
          )}
          {field.type === 'select' && (
            <select
              value={formData[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className="w-full border border-stone-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent bg-white"
            >
              <option value="">Select...</option>
              {field.options.map(opt => (
                <option key={opt} value={opt} className="capitalize">{opt}</option>
              ))}
            </select>
          )}
        </div>
      ))}

      {/* Location Details */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-textLight uppercase tracking-wider mb-2">Barangay</label>
          <input
            type="text"
            value={formData.barangay || ''}
            onChange={(e) => handleFieldChange('barangay', e.target.value)}
            placeholder="Optional"
            className="w-full border border-stone-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-textLight uppercase tracking-wider mb-2">Street/Landmark</label>
          <input
            type="text"
            value={formData.street || ''}
            onChange={(e) => handleFieldChange('street', e.target.value)}
            placeholder="Optional"
            className="w-full border border-stone-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent bg-white"
          />
        </div>
      </div>

      {/* Tags */}
      {disasterType.tags.length > 0 && (
        <div>
          <label className="block text-xs font-bold text-textLight uppercase tracking-wider mb-2">Tags (select all that apply)</label>
          <div className="flex flex-wrap gap-1.5">
            {disasterType.tags.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  (formData.tags || []).includes(tag)
                    ? 'bg-accent text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Photos */}
      <div>
        <label className="block text-xs font-bold text-textLight uppercase tracking-wider mb-2">
          Evidence Photos (up to {MAX_PHOTOS})
        </label>
        <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-stone-300 rounded-lg p-3 cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#78716c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span className="text-sm text-textLight font-medium">Add photos</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoAdd}
            className="hidden"
          />
        </label>

        {previewUrls.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {previewUrls.map((url, i) => (
              <div key={i} className="relative group">
                <img
                  src={url}
                  alt={`Preview ${i + 1}`}
                  className="w-full h-20 object-cover rounded-lg border border-stone-200"
                />
                <button
                  type="button"
                  onClick={() => handlePhotoRemove(i)}
                  className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
