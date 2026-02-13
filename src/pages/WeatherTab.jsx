import { useAllMunicipalitiesWeather } from '../hooks/useWeather';
import WeatherGrid from '../components/Weather/WeatherGrid';
import WeatherAlerts from '../components/Weather/WeatherAlerts';

export default function WeatherTab() {
  const { weatherData, loading } = useAllMunicipalitiesWeather();

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-4 space-y-4">
      {/* Province Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-4 text-white">
        <h2 className="text-xl font-bold">
          {'\u26C5'} Weather - Camarines Norte
        </h2>
        <p className="text-sm text-white/80 mt-1">
          Real-time weather conditions across all 12 municipalities
        </p>
      </div>

      {/* Weather Alerts */}
      <WeatherAlerts alerts={[]} />

      {/* Weather Grid */}
      <WeatherGrid weatherData={weatherData} loading={loading} />
    </div>
  );
}
