import { useAllMunicipalitiesWeather } from '../hooks/useWeather';
import WeatherGrid from '../components/Weather/WeatherGrid';
import WeatherAlerts from '../components/Weather/WeatherAlerts';
import { FEATURE_FLAGS } from '../config/featureFlags';
import FeatureFlag, { FeatureFlagDisabled } from '../components/Common/FeatureFlag';

export default function WeatherTab() {
  const { weatherData, loading } = useAllMunicipalitiesWeather();

  return (
    <div className="max-w-[1200px] xl:max-w-[1400px] mx-auto px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6 space-y-3">
      {/* Province Header */}
      <div className="bg-primary rounded-xl p-4 text-white">
        <div className="flex items-center gap-2">
          <svg
            aria-hidden="true"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2ec4b6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
          </svg>
          <h2 className="text-base font-bold tracking-wide">WEATHER &mdash; Camarines Norte</h2>
        </div>
        <p className="text-xs text-white/50 mt-1 ml-[30px]">
          Real-time conditions across all 12 municipalities
        </p>
      </div>

      <WeatherAlerts alerts={[]} />
      <FeatureFlag
        flag={FEATURE_FLAGS.WEATHER_ALERTS}
        fallback={
          <FeatureFlagDisabled flag={FEATURE_FLAGS.WEATHER_ALERTS}>
            <div className="bg-white rounded-xl p-4 text-center shadow-card border border-stone-100">
              <div className="w-10 h-10 mx-auto mb-2 bg-stone-100 rounded-full flex items-center justify-center">
                <svg
                  aria-hidden="true"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#78716c"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
                </svg>
              </div>
              <p className="font-semibold text-sm text-textLight">Weather alerts are coming soon</p>
              <p className="text-xs text-textLight mt-1">
                Stay tuned for real-time weather notifications
              </p>
            </div>
          </FeatureFlagDisabled>
        }
      >
        <WeatherGrid weatherData={weatherData} loading={loading} />
      </FeatureFlag>
    </div>
  );
}
