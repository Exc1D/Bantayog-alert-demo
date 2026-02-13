import { useState } from 'react';
import WeatherCard from './WeatherCard';
import { MUNICIPALITIES } from '../../utils/constants';
import LoadingSpinner from '../Common/LoadingSpinner';

export default function WeatherGrid({ weatherData, loading }) {
  const [selectedMunicipality, setSelectedMunicipality] = useState(null);

  if (loading) {
    return <LoadingSpinner text="Loading weather data..." />;
  }

  // Show detailed view
  if (selectedMunicipality) {
    return (
      <div>
        <button
          onClick={() => setSelectedMunicipality(null)}
          className="text-sm text-accent font-medium mb-4 hover:underline"
        >
          {'\u2190'} Back to all municipalities
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
      <h3 className="text-lg font-bold mb-4">
        Weather Across Camarines Norte
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
