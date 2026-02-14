import { DISASTER_TYPES } from '../../data/disasterTypes';

const TYPE_COLORS = {
  flood: 'border-blue-400 bg-blue-50',
  landslide: 'border-amber-600 bg-amber-50',
  fire: 'border-red-500 bg-red-50',
  earthquake: 'border-purple-500 bg-purple-50',
  typhoon: 'border-cyan-500 bg-cyan-50',
  health: 'border-pink-500 bg-pink-50',
  road_incident: 'border-orange-500 bg-orange-50',
  infrastructure: 'border-slate-500 bg-slate-50',
  environmental: 'border-emerald-500 bg-emerald-50',
  security: 'border-amber-500 bg-amber-50',
  other: 'border-gray-400 bg-gray-50'
};

export default function DisasterTypeSelector({ selectedType, onSelect }) {
  return (
    <div>
      <p className="text-sm text-textLight mb-3 text-center">
        Select the type of hazard you are reporting
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
        {DISASTER_TYPES.map((type) => {
          const isSelected = selectedType?.id === type.id;
          const colorClass = TYPE_COLORS[type.id] || TYPE_COLORS.other;

          return (
            <button
              key={type.id}
              onClick={() => onSelect(type)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all active:scale-95 ${
                isSelected
                  ? `${colorClass} shadow-md ring-1 ring-black/5`
                  : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50'
              }`}
            >
              <span className="text-2xl mb-1">{type.icon}</span>
              <span className="text-[11px] font-semibold text-center leading-tight text-text">{type.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
