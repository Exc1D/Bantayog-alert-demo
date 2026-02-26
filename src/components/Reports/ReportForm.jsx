import { SEVERITY_LEVELS } from '../../utils/constants';
import { useSanitization } from '../../hooks/useSanitization';

const SEVERITY_STYLES = {
  critical: {
    active: 'border-red-500 bg-red-50 text-red-800 ring-1 ring-red-200',
    icon: '\u{1F534}',
  },
  moderate: {
    active: 'border-amber-500 bg-amber-50 text-amber-800 ring-1 ring-amber-200',
    icon: '\u{1F7E0}',
  },
  minor: {
    active: 'border-green-500 bg-green-50 text-green-800 ring-1 ring-green-200',
    icon: '\u{1F7E2}',
  },
};

export default function ReportForm({ formData, onChange }) {
  const { sanitize, getFieldState } = useSanitization({ maxLength: 2000 });

  const handleFieldChange = (name, value) => {
    const sanitizedValue = sanitize(name, value, 'text');
    onChange({ ...formData, [name]: sanitizedValue });
  };

  const descriptionState = getFieldState('description');
  const barangayState = getFieldState('barangay');
  const streetState = getFieldState('street');

  return (
    <div className="space-y-4">
      {/* Severity */}
      <fieldset>
        <legend className="block text-xs font-bold text-textLight uppercase tracking-wider mb-2">
          Severity Level <span className="text-accent">*</span>
        </legend>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Severity level">
          {SEVERITY_LEVELS.map((level) => {
            const style = SEVERITY_STYLES[level];
            return (
              <button
                key={level}
                type="button"
                role="radio"
                aria-checked={formData.severity === level}
                onClick={() => handleFieldChange('severity', level)}
                className={`p-2.5 rounded-lg border-2 text-sm font-bold capitalize transition-all ${
                  formData.severity === level
                    ? style.active
                    : 'border-stone-200 hover:border-stone-300 text-textLight'
                }`}
              >
                <span className="mr-1" aria-hidden="true">
                  {style.icon}
                </span>{' '}
                {level}
              </button>
            );
          })}
        </div>
      </fieldset>

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
            descriptionState.warning ? 'border-amber-400' : 'border-stone-300'
          }`}
          rows="3"
          required
          aria-required="true"
        />
        {descriptionState.warning && (
          <p className="text-xs text-amber-600 mt-1" role="alert">
            {descriptionState.warning}
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
              barangayState.warning ? 'border-amber-400' : 'border-stone-300'
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
              streetState.warning ? 'border-amber-400' : 'border-stone-300'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
