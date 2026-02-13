import { DISASTER_TYPES } from '../../data/disasterTypes';

export default function DisasterTypeSelector({ selectedType, onSelect }) {
  return (
    <div>
      <h3 className="text-lg font-bold mb-4 text-center">What type of disaster?</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {DISASTER_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelect(type)}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
              selectedType?.id === type.id
                ? 'border-accent bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span className="text-3xl mb-1">{type.icon}</span>
            <span className="text-xs font-semibold text-center leading-tight">{type.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
