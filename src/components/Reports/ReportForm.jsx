import { containsXSS, truncateText } from '../../utils/sanitization';

// Sanitize text for XSS but don't trim (to allow spaces during typing)
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /data:\s*text\/html/gi,
];

function sanitizeWithoutTrim(text) {
  if (text === null || text === undefined) {
    return '';
  }
  let sanitized = String(text);
  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }
  // Remove control characters but preserve spaces
  // eslint-disable-next-line no-control-regex
  return sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').replace(/\u200B/g, '');
}

export default function ReportForm({ formData, onChange }) {
  const handleFieldChange = (name, value) => {
    // Sanitize XSS content and truncate, but don't trim during typing to allow spaces
    const sanitizedValue = sanitizeWithoutTrim(value);
    const truncatedValue = truncateText(sanitizedValue, 2000);
    onChange({ ...formData, [name]: truncatedValue });
  };

  // Check if original input contained XSS (for warning display)
  const descriptionWarning =
    formData.description && containsXSS(formData.description)
      ? 'Potentially unsafe content was removed'
      : null;
  const barangayWarning =
    formData.barangay && containsXSS(formData.barangay)
      ? 'Potentially unsafe content was removed'
      : null;
  const streetWarning =
    formData.street && containsXSS(formData.street)
      ? 'Potentially unsafe content was removed'
      : null;

  return (
    <div className="space-y-4">
      {/* Description */}
      <div>
        <label
          htmlFor="report-description"
          className="block text-xs font-bold text-textLight uppercase tracking-wider mb-2"
        >
          What is happening? <span className="text-accent">*</span>
        </label>
        <textarea
          id="report-description"
          value={formData.description || ''}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder="Describe what you see: location details, severity, and any immediate dangers..."
          className={`w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent resize-none bg-white ${
            descriptionWarning ? 'border-amber-400' : 'border-stone-300'
          }`}
          rows="3"
          required
          aria-required="true"
        />
        {descriptionWarning && (
          <p className="text-xs text-amber-600 mt-1" role="alert">
            {descriptionWarning}
          </p>
        )}
      </div>

      {/* Location Details */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="report-barangay"
            className="block text-xs font-bold text-textLight uppercase tracking-wider mb-2"
          >
            Barangay
          </label>
          <input
            id="report-barangay"
            type="text"
            value={formData.barangay || ''}
            onChange={(e) => handleFieldChange('barangay', e.target.value)}
            placeholder="Optional"
            className={`w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent bg-white ${
              barangayWarning ? 'border-amber-400' : 'border-stone-300'
            }`}
          />
        </div>
        <div>
          <label
            htmlFor="report-street"
            className="block text-xs font-bold text-textLight uppercase tracking-wider mb-2"
          >
            Street/Landmark
          </label>
          <input
            id="report-street"
            type="text"
            value={formData.street || ''}
            onChange={(e) => handleFieldChange('street', e.target.value)}
            placeholder="Optional"
            className={`w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent bg-white ${
              streetWarning ? 'border-amber-400' : 'border-stone-300'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
