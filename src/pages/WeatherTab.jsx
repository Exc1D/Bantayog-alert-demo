import { useAllMunicipalitiesWeather } from '../hooks/useWeather';
import WeatherGrid from '../components/Weather/WeatherGrid';
import WeatherAlerts from '../components/Weather/WeatherAlerts';

export default function WeatherTab() {
  const { weatherData, loading } = useAllMunicipalitiesWeather();

  return (
    <div className="max-w-[1200px] mx-auto px-3 py-3 sm:px-4 sm:py-4 space-y-3">
      {/* Province Header */}
      <div className="bg-primary rounded-xl p-4 text-white">
        <div className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2ec4b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
          </svg>
          <h2 className="text-base font-bold tracking-wide">
            WEATHER &mdash; Camarines Norte
          </h2>
        </div>
        <p className="text-xs text-white/50 mt-1 ml-[30px]">
          Real-time conditions across all 12 municipalities
        </p>
      </div>

      <WeatherAlerts alerts={[]} />
      <WeatherGrid weatherData={weatherData} loading={loading} />
    </div>
  );
}
