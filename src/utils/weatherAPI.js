const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

function degreesToCardinal(degrees) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(degrees / 45) % 8];
}

export async function fetchCurrentWeather(lat, lng) {
  if (!OPENWEATHER_API_KEY) {
    return getMockWeather();
  }

  try {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) throw new Error('Weather fetch failed');

    const data = await response.json();

    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      windSpeed: Math.round(data.wind.speed * 3.6),
      windDirection: degreesToCardinal(data.wind.deg),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      visibility: data.visibility
    };
  } catch (error) {
    console.error('Weather API error:', error);
    return getMockWeather();
  }
}

export async function fetchForecast(lat, lng) {
  if (!OPENWEATHER_API_KEY) {
    return getMockForecast();
  }

  try {
    const response = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) throw new Error('Forecast fetch failed');

    const data = await response.json();

    // Group by day and extract daily summaries
    const dailyMap = {};
    for (const item of data.list) {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyMap[date]) {
        dailyMap[date] = {
          date,
          tempMax: item.main.temp_max,
          tempMin: item.main.temp_min,
          condition: item.weather[0].main,
          icon: item.weather[0].icon,
          rainfall: item.rain ? item.rain['3h'] || 0 : 0
        };
      } else {
        dailyMap[date].tempMax = Math.max(dailyMap[date].tempMax, item.main.temp_max);
        dailyMap[date].tempMin = Math.min(dailyMap[date].tempMin, item.main.temp_min);
        dailyMap[date].rainfall += item.rain ? item.rain['3h'] || 0 : 0;
      }
    }

    return Object.values(dailyMap).slice(0, 5).map(day => ({
      ...day,
      tempMax: Math.round(day.tempMax),
      tempMin: Math.round(day.tempMin),
      rainfall: Math.round(day.rainfall)
    }));
  } catch (error) {
    console.error('Forecast API error:', error);
    return getMockForecast();
  }
}

export async function fetchWeatherAlerts(lat, lng) {
  if (!OPENWEATHER_API_KEY) {
    return [];
  }

  try {
    const response = await fetch(
      `${BASE_URL}/onecall?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&exclude=minutely,hourly`
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.alerts || [];
  } catch {
    return [];
  }
}

function getMockWeather() {
  return {
    temperature: 28,
    feelsLike: 32,
    condition: 'Partly Cloudy',
    description: 'partly cloudy',
    icon: '02d',
    windSpeed: 15,
    windDirection: 'NE',
    humidity: 75,
    pressure: 1013,
    visibility: 10000
  };
}

function getMockForecast() {
  const today = new Date();
  return Array.from({ length: 5 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString().split('T')[0],
      tempMax: 32 - i,
      tempMin: 25 + i,
      condition: ['Clouds', 'Rain', 'Thunderstorm', 'Rain', 'Clouds'][i],
      icon: ['03d', '10d', '11d', '10d', '03d'][i],
      rainfall: [0, 15, 45, 20, 5][i]
    };
  });
}
