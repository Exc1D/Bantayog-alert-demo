const WEATHER_ICONS = {
  '01d': '\u2600\uFE0F', '01n': '\u{1F319}',
  '02d': '\u26C5', '02n': '\u26C5',
  '03d': '\u2601\uFE0F', '03n': '\u2601\uFE0F',
  '04d': '\u2601\uFE0F', '04n': '\u2601\uFE0F',
  '09d': '\u{1F327}\uFE0F', '09n': '\u{1F327}\uFE0F',
  '10d': '\u{1F326}\uFE0F', '10n': '\u{1F326}\uFE0F',
  '11d': '\u26C8\uFE0F', '11n': '\u26C8\uFE0F',
  '13d': '\u{1F328}\uFE0F', '13n': '\u{1F328}\uFE0F',
  '50d': '\u{1F32B}\uFE0F', '50n': '\u{1F32B}\uFE0F'
};

export default function WeatherCard({ municipality, weather, compact = false }) {
  if (!weather) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-bold text-sm">{municipality}</h3>
        <p className="text-xs text-textLight mt-1">Weather data unavailable</p>
      </div>
    );
  }

  const weatherIcon = WEATHER_ICONS[weather.icon] || '\u2601\uFE0F';

  if (compact) {
    return (
      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm truncate">{municipality}</h3>
          <span className="text-2xl">{weatherIcon}</span>
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-bold">{weather.temperature}</span>
          <span className="text-sm text-textLight">&deg;C</span>
        </div>
        <p className="text-xs text-textLight capitalize">{weather.description || weather.condition}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">{municipality}</h3>
            <p className="text-sm text-white/80 capitalize">{weather.description || weather.condition}</p>
          </div>
          <span className="text-4xl">{weatherIcon}</span>
        </div>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-4xl font-bold">{weather.temperature}</span>
          <span className="text-lg">&deg;C</span>
        </div>
        {weather.feelsLike && (
          <p className="text-xs text-white/70 mt-0.5">Feels like {weather.feelsLike}&deg;C</p>
        )}
      </div>

      {/* Details */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <div className="text-center">
          <p className="text-xs text-textLight">Wind</p>
          <p className="font-semibold text-sm">
            {weather.windSpeed} kph {weather.windDirection}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-textLight">Humidity</p>
          <p className="font-semibold text-sm">{weather.humidity}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-textLight">Pressure</p>
          <p className="font-semibold text-sm">{weather.pressure} hPa</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-textLight">Visibility</p>
          <p className="font-semibold text-sm">{weather.visibility ? `${(weather.visibility / 1000).toFixed(1)} km` : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}
