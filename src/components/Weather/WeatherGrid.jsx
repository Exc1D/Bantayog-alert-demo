import { useState } from 'react';
import WeatherCard from './WeatherCard';
import { MUNICIPALITIES } from '../../utils/constants';
import LoadingSpinner from '../Common/LoadingSpinner';

export default function WeatherGrid({ weatherData, loading }) {
  const [selectedMunicipality, setSelectedMunicipality] = useState(null);

  if (loading) {
    return <LoadingSpinner text="Loading weather data..." />;
  }

  if (selectedMunicipality) {
    return (
      <div>
        <button
          onClick={() => setSelectedMunicipality(null)}
          className="text-xs text-accent font-semibold mb-3 hover:underline flex items-center gap-1"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to all municipalities
        </button>
        <WeatherCard
          municipality={selectedMunicipality}
          weather={weatherData[selectedMunicipality]}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {MUNICIPALITIES.map(municipality => (
          <button
            key={municipality}
            onClick={() => setSelectedMunicipality(municipality)}
            className="text-left"
          >
            <WeatherCard
              municipality={municipality}
              weather={weatherData[municipality]}
              compact
            />
          </button>
        ))}
      </div>
    </div>
  );
}
