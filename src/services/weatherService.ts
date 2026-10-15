import { WeatherData, WeatherDay, WeatherStatus } from '../types/trip';

export function decodeWeatherCode(code: number): { description: string; icon: string } {
  switch (code) {
    case 0:
      return { description: 'Clear sky', icon: '☀️' };
    case 1:
      return { description: 'Mainly clear', icon: '🌤️' };
    case 2:
      return { description: 'Partly cloudy', icon: '⛅' };
    case 3:
      return { description: 'Overcast', icon: '☁️' };
    case 45:
    case 48:
      return { description: 'Fog & misty', icon: '🌫️' };
    case 51:
    case 53:
    case 55:
      return { description: 'Drizzle', icon: '🌦️' };
    case 61:
    case 63:
    case 65:
      return { description: 'Rain', icon: '🌧️' };
    case 71:
    case 73:
    case 75:
      return { description: 'Snowfall', icon: '❄️' };
    case 77:
      return { description: 'Snow grains', icon: '🌨️' };
    case 80:
    case 81:
    case 82:
      return { description: 'Rain showers', icon: '🌦️' };
    case 85:
    case 86:
      return { description: 'Snow showers', icon: '🌨️' };
    case 95:
      return { description: 'Thunderstorm', icon: '⛈️' };
    case 96:
    case 99:
      return { description: 'Thunderstorm with hail', icon: '🌩️' };
    default:
      return { description: 'Partly cloudy', icon: '⛅' };
  }
}

export async function fetchDestinationWeather(
  destination: string,
  startDate?: string,
  endDate?: string
): Promise<WeatherStatus> {
  if (!destination || destination.trim() === '') {
    return {
      loading: false,
      error: 'Please enter a destination to see the weather forecast.',
      data: null,
      isAvailable: false,
    };
  }

  try {
    // 1. Geocode destination using Open-Meteo Geocoding API
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      destination.trim()
    )}&count=1&language=en&format=json`;

    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) {
      throw new Error(`Geocoding failed with status ${geoRes.status}`);
    }

    const geoData = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0) {
      return {
        loading: false,
        error: `Could not find coordinates for "${destination}". Please try a more specific city name.`,
        data: null,
        isAvailable: false,
      };
    }

    const top = geoData.results[0];
    const lat = top.latitude;
    const lon = top.longitude;
    const resolvedName = [top.name, top.admin1, top.country].filter(Boolean).join(', ');

    // 2. Date range validation:
    // Open-Meteo forecast API supports up to 14-16 days ahead.
    // If selected travel dates are > 14 days in the future, do not invent weather!
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate) {
      const tripStart = new Date(startDate);
      tripStart.setHours(0, 0, 0, 0);
      const diffTime = tripStart.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 14) {
        return {
          loading: false,
          error: null,
          data: null,
          isAvailable: false,
          unavailableReason: `Open-Meteo live forecasts are available up to 14 days in advance. Your selected trip starts on ${tripStart.toLocaleDateString(
            undefined,
            { month: 'short', day: 'numeric', year: 'numeric' }
          )} (${diffDays} days away). As per meteorological standards, we do not invent fake weather—please check back closer to your departure!`,
        };
      }

      if (diffDays < -1) {
        return {
          loading: false,
          error: null,
          data: null,
          isAvailable: false,
          unavailableReason: `The selected start date (${tripStart.toLocaleDateString(
            undefined,
            { month: 'short', day: 'numeric', year: 'numeric' }
          )}) is in the past. Live forecast is only available for upcoming dates within the next 14 days.`,
        };
      }
    }

    // 3. Fetch live 7-day forecast from Open-Meteo
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max&current_weather=true&timezone=auto&forecast_days=7`;

    const forecastRes = await fetch(forecastUrl);
    if (!forecastRes.ok) {
      throw new Error(`Open-Meteo forecast responded with status ${forecastRes.status}`);
    }

    const forecastJson = await forecastRes.json();
    const daily = forecastJson.daily;
    const current = forecastJson.current_weather;

    if (!daily || !daily.time) {
      throw new Error('Incomplete meteorological data received from Open-Meteo');
    }

    const days: WeatherDay[] = daily.time.map((dateStr: string, idx: number) => {
      const code = daily.weathercode?.[idx] ?? 1;
      const decoded = decodeWeatherCode(code);
      const maxC = Math.round(daily.temperature_2m_max?.[idx] ?? 20);
      const minC = Math.round(daily.temperature_2m_min?.[idx] ?? 14);

      return {
        date: dateStr,
        maxTempC: maxC,
        minTempC: minC,
        maxTempF: Math.round((maxC * 9) / 5 + 32),
        minTempF: Math.round((minC * 9) / 5 + 32),
        precipitationProb: Math.round(daily.precipitation_probability_max?.[idx] ?? 0),
        weatherCode: code,
        weatherDescription: decoded.description,
        icon: decoded.icon,
        windSpeedKmh: Math.round(daily.windspeed_10m_max?.[idx] ?? 10),
      };
    });

    const currentCode = current?.weathercode ?? 1;
    const currentDecoded = decodeWeatherCode(currentCode);
    const currTempC = Math.round(current?.temperature ?? days[0]?.maxTempC ?? 20);

    return {
      loading: false,
      error: null,
      isAvailable: true,
      data: {
        resolvedLocation: resolvedName,
        latitude: lat,
        longitude: lon,
        days,
        currentTempC: currTempC,
        currentTempF: Math.round((currTempC * 9) / 5 + 32),
        currentDescription: currentDecoded.description,
        currentIcon: currentDecoded.icon,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to reach weather service';
    return {
      loading: false,
      error: `Unable to fetch live weather: ${message}`,
      data: null,
      isAvailable: false,
    };
  }
}
