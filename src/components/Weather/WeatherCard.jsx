const WEATHER_ICONS = {
  '01d': '\u2600\uFE0F',
  '01n': '\u{1F319}',
  '02d': '\u26C5',
  '02n': '\u26C5',
  '03d': '\u2601\uFE0F',
  '03n': '\u2601\uFE0F',
  '04d': '\u2601\uFE0F',
  '04n': '\u2601\uFE0F',
  '09d': '\u{1F327}\uFE0F',
  '09n': '\u{1F327}\uFE0F',
  '10d': '\u{1F326}\uFE0F',
  '10n': '\u{1F326}\uFE0F',
  '11d': '\u26C8\uFE0F',
  '11n': '\u26C8\uFE0F',
  '13d': '\u{1F328}\uFE0F',
  '13n': '\u{1F328}\uFE0F',
  '50d': '\u{1F32B}\uFE0F',
  '50n': '\u{1F32B}\uFE0F',
};

function getDayName(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

  return date.toLocaleDateString('en-PH', { weekday: 'short' });
}

function MiniForecast({ forecast }) {
  if (!forecast || forecast.length === 0) return null;

  const displayForecast = forecast.slice(0, 5);

  return (
    <div className="border-t border-stone-100 dark:border-dark-border p-3">
      <p className="text-[10px] text-textMuted dark:text-dark-textMuted uppercase tracking-wider font-semibold mb-2">
        5-Day Forecast
      </p>
      <div className="flex justify-between gap-1">
        {displayForecast.map((day) => (
          <div key={day.date} className="flex flex-col items-center">
            <span className="text-[9px] font-medium text-textLight dark:text-dark-textLight">
              {getDayName(day.date)}
            </span>
            <span className="text-lg my-1">{WEATHER_ICONS[day.icon] || '\u2601\uFE0F'}</span>
            <span className="text-[10px] font-bold text-text dark:text-dark-text">
              {day.tempMax}&deg;
            </span>
            <span className="text-[9px] text-textMuted dark:text-dark-textMuted">
              {day.tempMin}&deg;
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompactForecast({ forecast }) {
  if (!forecast || forecast.length === 0) return null;

  const displayForecast = forecast.slice(0, 3);

  return (
    <div className="flex gap-1 mt-1">
      {displayForecast.map((day) => (
        <div key={day.date} className="flex flex-col items-center">
          <span className="text-[8px] text-textMuted dark:text-dark-textMuted">
            {getDayName(day.date)}
          </span>
          <span className="text-xs">{WEATHER_ICONS[day.icon] || '\u2601\uFE0F'}</span>
        </div>
      ))}
    </div>
  );
}

export default function WeatherCard({ municipality, weather, forecast, compact = false }) {
  if (!weather) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-xl p-4 shadow-card border border-stone-100 dark:border-dark-border">
        <h3 className="font-bold text-sm">{municipality}</h3>
        <p className="text-xs text-textMuted dark:text-dark-textMuted mt-1">
          Weather data unavailable
        </p>
      </div>
    );
  }

  const weatherIcon = WEATHER_ICONS[weather.icon] || '\u2601\uFE0F';

  if (compact) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-xl p-3 shadow-card border border-stone-100 dark:border-dark-border hover:shadow-card-hover transition-shadow">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs truncate dark:text-dark-text">{municipality}</h3>
          <span className="text-xl">{weatherIcon}</span>
        </div>
        <div className="flex items-baseline gap-0.5 mt-1">
          <span className="text-xl font-bold dark:text-dark-text">{weather.temperature}</span>
          <span className="text-xs text-textLight dark:text-dark-textLight">&deg;C</span>
        </div>
        <p className="text-[10px] text-textMuted dark:text-dark-textMuted capitalize truncate">
          {weather.description || weather.condition}
        </p>
        <CompactForecast forecast={forecast} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-card border border-stone-100 dark:border-dark-border overflow-hidden hover:shadow-card-hover transition-shadow">
      {/* Header */}
      <div className="bg-primary text-white p-4 dark:bg-dark-card dark:text-dark-text">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base">{municipality}</h3>
            <p className="text-xs text-white/50 capitalize dark:text-dark-textLight">
              {weather.description || weather.condition}
            </p>
          </div>
          <span className="text-3xl">{weatherIcon}</span>
        </div>
        <div className="flex items-baseline gap-0.5 mt-2">
          <span className="text-3xl font-bold">{weather.temperature}</span>
          <span className="text-sm text-white/60 dark:text-dark-textLight">&deg;C</span>
        </div>
        {weather.feelsLike && (
          <p className="text-[10px] text-white/40 mt-0.5 dark:text-dark-textMuted">
            Feels like {weather.feelsLike}&deg;C
          </p>
        )}
      </div>

      {/* Details */}
      <div className="p-3 grid grid-cols-2 gap-2">
        <div className="bg-stone-50 dark:bg-stone-800/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-textMuted dark:text-dark-textMuted uppercase tracking-wider font-semibold">
            Wind
          </p>
          <p className="font-bold text-xs mt-0.5">
            {weather.windSpeed} kph {weather.windDirection}
          </p>
        </div>
        <div className="bg-stone-50 dark:bg-stone-800/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-textMuted dark:text-dark-textMuted uppercase tracking-wider font-semibold">
            Humidity
          </p>
          <p className="font-bold text-xs mt-0.5">{weather.humidity}%</p>
        </div>
        <div className="bg-stone-50 dark:bg-stone-800/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-textMuted dark:text-dark-textMuted uppercase tracking-wider font-semibold">
            Pressure
          </p>
          <p className="font-bold text-xs mt-0.5">{weather.pressure} hPa</p>
        </div>
        <div className="bg-stone-50 dark:bg-stone-800/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-textMuted dark:text-dark-textMuted uppercase tracking-wider font-semibold">
            Visibility
          </p>
          <p className="font-bold text-xs mt-0.5">
            {weather.visibility ? `${(weather.visibility / 1000).toFixed(1)} km` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Mini Forecast */}
      <MiniForecast forecast={forecast} />
    </div>
  );
}
