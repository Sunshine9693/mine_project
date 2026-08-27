const axios = require('axios');

const cache = new Map();
const CACHE_MS = 10 * 60 * 1000;

const weatherError = (code, message, status = 502) =>
  Object.assign(new Error(message), { code, status });

const normalizeCity = (city) => String(city || '')
  .trim()
  .replace(/^(?:how(?:'s|\s+is)\s+)?/i, '')
  .replace(/^(?:the\s+)?weather\s+(?:in|for)\s+/i, '')
  .replace(/^(?:what(?:'s|\s+is)\s+)?(?:the\s+)?temperature\s+(?:in|for)\s+/i, '')
  .replace(/[?.!,]+$/g, '')
  .replace(/\s+(?:today|tomorrow|tonight|forecast|right now)\s*$/i, '')
  .replace(/[?.!,]+$/g, '')
  .replace(/\s+/g, ' ')
  .slice(0, 100);

const getWeatherDescription = (code) => {
  const descriptions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snowfall',
    73: 'Moderate snowfall',
    75: 'Heavy snowfall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };

  return descriptions[code] || 'Unknown';
};

const getWeather = async (city) => {
  const normalizedCity = normalizeCity(city);

  console.log('[AURA Weather] City received:', normalizedCity);

  if (!normalizedCity) {
    throw weatherError(
      'WEATHER_CITY_REQUIRED',
      'Please provide a city for the weather.',
      400
    );
  }


  const cacheKey = normalizedCity.toLowerCase();

  const cached = cache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  try {
    // 1. Convert city name → latitude/longitude
    const geoResponse = await axios.get(
      'https://geocoding-api.open-meteo.com/v1/search',
      {
        params: {
          name: normalizedCity,
          count: 1,
          language: 'en',
          format: 'json',
        },
        timeout: 10000,
      }
    );

    const location = geoResponse.data?.results?.[0];

    console.log('[AURA Weather] Geocoding result:', location ? {
      name: location.name,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude,
    } : 'no match');

    if (!location) {
      throw weatherError(
        'WEATHER_CITY_NOT_FOUND',
        'I could not find that city.',
        404
      );
    }

    const { latitude, longitude } = location;

    // 2. Get weather data
    const weatherResponse = await axios.get(
      'https://api.open-meteo.com/v1/forecast',
      {
        params: {
          latitude,
          longitude,

          current: [
            'temperature_2m',
            'apparent_temperature',
            'relative_humidity_2m',
            'weather_code',
            'wind_speed_10m',
            'precipitation',
            'rain',
            'snowfall',
          ].join(','),

          daily: [
            'weather_code',
            'temperature_2m_max',
            'temperature_2m_min',
            'precipitation_probability_max',
            'precipitation_sum',
            'sunrise',
            'sunset',
          ].join(','),

          timezone: 'auto',
          forecast_days: 5,
        },

        timeout: 10000,
      }
    );

    const data = weatherResponse.data;

    const current = data.current;
    const daily = data.daily;

    // 3. Build 5-day forecast
    const forecast = (daily.time || []).map((date, index) => ({
      date,

      temperature: Math.round(
        daily.temperature_2m_max?.[index] ?? 0
      ),

      minTemperature: Math.round(
        daily.temperature_2m_min?.[index] ?? 0
      ),

      condition: getWeatherDescription(
        daily.weather_code?.[index]
      ),

      precipitationProbability:
        daily.precipitation_probability_max?.[index] ?? 0,

      precipitation:
        daily.precipitation_sum?.[index] ?? 0,
    }));

    // 4. Create clean AURA weather object
    const value = {
      city: location.name,
      country: location.country,
      latitude,
      longitude,

      temperature: Math.round(current.temperature_2m),

      feelsLike: Math.round(
        current.apparent_temperature
      ),

      condition: getWeatherDescription(
        current.weather_code
      ),

      humidity: current.relative_humidity_2m,

      windSpeed: Math.round(
        current.wind_speed_10m
      ),

      precipitation: current.precipitation ?? 0,

      rain: current.rain ?? 0,

      snowfall: current.snowfall ?? 0,

      sunrise: daily.sunrise?.[0] || null,

      sunset: daily.sunset?.[0] || null,

      forecast,
    };

    // 5. Cache result
    cache.set(cacheKey, {
      value,
      expiresAt: Date.now() + CACHE_MS,
    });

    return value;
  } catch (error) {
    // Preserve our custom errors
    if (error.code === 'WEATHER_CITY_NOT_FOUND') {
      throw error;
    }

    if (error.code === 'WEATHER_CITY_REQUIRED') {
      throw error;
    }

    console.error('[AURA Weather Error]:', error.message);

    if (error.response?.status === 429) {
      throw weatherError(
        'WEATHER_RATE_LIMITED',
        'Weather service is temporarily busy. Please try again shortly.',
        429
      );
    }

    throw weatherError(
      'WEATHER_UNAVAILABLE',
      'Weather is temporarily unavailable. Please try again.',
      502
    );
  }
};

module.exports = {
  getWeather,
  normalizeCity,
  CACHE_MS,
};