import { useState } from 'react';
import { SEVERITY_LEVELS, MAX_PHOTOS } from '../../utils/constants';
import { validateImage } from '../../utils/imageCompression';
import { useToast } from '../Common/Toast';

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

    // Create preview URLs
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
      <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
        <span className="text-3xl">{disasterType.icon}</span>
        <div>
          <p className="font-bold">{disasterType.label}</p>
          <p className="text-xs text-textLight">{disasterType.description}</p>
        </div>
      </div>

      {/* Severity */}
      <div>
        <label className="block text-sm font-semibold mb-1.5">
          Severity Level <span className="text-danger">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {SEVERITY_LEVELS.map(level => (
            <button
              key={level}
              type="button"
              onClick={() => handleFieldChange('severity', level)}
              className={`p-2.5 rounded-lg border-2 text-sm font-semibold capitalize transition-all ${
                formData.severity === level
                  ? level === 'critical'
                    ? 'border-red-500 bg-red-50 text-red-800'
                    : level === 'moderate'
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-800'
                    : 'border-green-500 bg-green-50 text-green-800'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold mb-1.5">
          Description <span className="text-danger">*</span>
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder="Describe what you see. Be specific about location, severity, and any dangers..."
          className="w-full border-2 border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent focus:border-accent resize-none"
          rows="3"
          required
        />
      </div>

      {/* Type-specific fields */}
      {disasterType.fields.map(field => (
        <div key={field.name}>
          <label className="block text-sm font-semibold mb-1.5">{field.label}</label>
          {field.type === 'number' && (
            <input
              type="number"
              value={formData[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, Number(e.target.value))}
              min={field.min}
              max={field.max}
              className="w-full border-2 border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
            />
          )}
          {field.type === 'boolean' && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleFieldChange(field.name, true)}
                className={`flex-1 p-2 rounded-lg border-2 text-sm font-medium ${
                  formData[field.name] === true
                    ? 'border-accent bg-blue-50 text-accent'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleFieldChange(field.name, false)}
                className={`flex-1 p-2 rounded-lg border-2 text-sm font-medium ${
                  formData[field.name] === false
                    ? 'border-accent bg-blue-50 text-accent'
                    : 'border-gray-200 hover:border-gray-300'
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
              className="w-full border-2 border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
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
          <label className="block text-sm font-semibold mb-1.5">Barangay</label>
          <input
            type="text"
            value={formData.barangay || ''}
            onChange={(e) => handleFieldChange('barangay', e.target.value)}
            placeholder="Optional"
            className="w-full border-2 border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5">Street/Landmark</label>
          <input
            type="text"
            value={formData.street || ''}
            onChange={(e) => handleFieldChange('street', e.target.value)}
            placeholder="Optional"
            className="w-full border-2 border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
          />
        </div>
      </div>

      {/* Tags */}
      {disasterType.tags.length > 0 && (
        <div>
          <label className="block text-sm font-semibold mb-1.5">Tags (select all that apply)</label>
          <div className="flex flex-wrap gap-2">
            {disasterType.tags.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  (formData.tags || []).includes(tag)
                    ? 'bg-accent text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
        <label className="block text-sm font-semibold mb-1.5">
          Photos (up to {MAX_PHOTOS})
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoAdd}
          className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-accent hover:file:bg-blue-100"
        />

        {previewUrls.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {previewUrls.map((url, i) => (
              <div key={i} className="relative">
                <img
                  src={url}
                  alt={`Preview ${i + 1}`}
                  className="w-full h-20 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handlePhotoRemove(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center"
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
