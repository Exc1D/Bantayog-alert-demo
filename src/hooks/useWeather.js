import { useState, useEffect, useCallback } from 'react';
import { fetchCurrentWeather, fetchForecast } from '../utils/weatherAPI';
import { MUNICIPALITY_COORDS, WEATHER_CACHE_DURATION } from '../utils/constants';

const weatherCache = new Map();

export function useWeather(municipality) {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeather = useCallback(async () => {
    if (!municipality) return;

    const coords = MUNICIPALITY_COORDS[municipality];
    if (!coords) {
      setError('Unknown municipality');
      setLoading(false);
      return;
    }

    // Check cache
    const cached = weatherCache.get(municipality);
    if (cached && Date.now() - cached.timestamp < WEATHER_CACHE_DURATION) {
      setWeather(cached.weather);
      setForecast(cached.forecast);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [weatherData, forecastData] = await Promise.all([
        fetchCurrentWeather(coords.lat, coords.lng),
        fetchForecast(coords.lat, coords.lng)
      ]);

      setWeather(weatherData);
      setForecast(forecastData);

      // Cache the result
      weatherCache.set(municipality, {
        weather: weatherData,
        forecast: forecastData,
        timestamp: Date.now()
      });

      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [municipality]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  return { weather, forecast, loading, error, refresh: fetchWeather };
}

export function useAllMunicipalitiesWeather() {
  const [weatherData, setWeatherData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const results = {};

      const entries = Object.entries(MUNICIPALITY_COORDS);
      const promises = entries.map(async ([name, coords]) => {
        try {
          const weather = await fetchCurrentWeather(coords.lat, coords.lng);
          results[name] = weather;
        } catch {
          results[name] = null;
        }
      });

      await Promise.all(promises);
      setWeatherData(results);
      setLoading(false);
    }

    fetchAll();
  }, []);

  return { weatherData, loading };
}
