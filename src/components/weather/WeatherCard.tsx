import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Droplets,
  Wind,
  AlertCircle,
  Info,
  Calendar,
  MapPin,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { WeatherStatus } from '../../types/trip';
import { fetchDestinationWeather } from '../../services/weatherService';

interface WeatherCardProps {
  destination: string;
  startDate?: string;
  endDate?: string;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  destination,
  startDate,
  endDate,
}) => {
  const [weatherStatus, setWeatherStatus] = useState<WeatherStatus>({
    loading: true,
    error: null,
    data: null,
    isAvailable: false,
  });
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [ignoreDateLimit, setIgnoreDateLimit] = useState(false);

  const loadWeather = () => {
    if (!destination) return;
    setWeatherStatus((prev) => ({ ...prev, loading: true, error: null }));

    // If traveler clicked "view current forecast anyway", pass undefined dates
    const effectiveStart = ignoreDateLimit ? undefined : startDate;
    const effectiveEnd = ignoreDateLimit ? undefined : endDate;

    fetchDestinationWeather(destination, effectiveStart, effectiveEnd).then((status) => {
      setWeatherStatus(status);
    });
  };

  useEffect(() => {
    setIgnoreDateLimit(false);
  }, [destination, startDate, endDate]);

  useEffect(() => {
    loadWeather();
  }, [destination, startDate, endDate, ignoreDateLimit]);

  // Loading State
  if (weatherStatus.loading) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 rounded-lg" />
            <div className="h-4 w-72 bg-slate-100 rounded-md" />
          </div>
          <div className="h-8 w-24 bg-slate-200 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-3">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-36 bg-slate-100 rounded-2xl p-4 flex flex-col justify-between" />
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (weatherStatus.error) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 text-rose-600">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Unable to Load Weather</h3>
            <p className="text-xs text-rose-600">{weatherStatus.error}</p>
          </div>
        </div>
        <div className="pt-2">
          <button
            onClick={loadWeather}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Unavailable State (Selected dates outside 14-day window or past; prompt strictly says "do not invent weather")
  if (!weatherStatus.isAvailable && weatherStatus.unavailableReason) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-100/70 border border-amber-200 flex items-center justify-center flex-shrink-0 text-amber-700">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  Weather Forecast Unavailable for Selected Dates
                </h3>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  No Guesswork
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed max-w-2xl">
                {weatherStatus.unavailableReason}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIgnoreDateLimit(true)}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold border border-teal-200 shadow-xs transition"
          >
            <CloudSun className="w-4 h-4 text-teal-600" />
            <span>Show Current 7-Day Forecast</span>
          </button>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Provider: <strong className="text-slate-700">Open-Meteo Global Forecasting</strong> (real meteorological model data)
          </span>
          <span className="text-[11px] text-teal-700 font-medium">Zero Synthetic Data</span>
        </div>
      </div>
    );
  }

  const data = weatherStatus.data;
  if (!data) return null;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
              <CloudSun className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
              Live Weather Outlook
            </h3>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              Live Open-Meteo
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            <span>{data.resolvedLocation}</span>
            <span className="text-slate-300">•</span>
            <span>
              Lat: {data.latitude.toFixed(2)}, Lon: {data.longitude.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Temperature unit switch */}
        <div className="flex items-center self-start sm:self-auto bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
          <button
            onClick={() => setUnit('C')}
            className={`px-3 py-1.5 rounded-lg transition ${
              unit === 'C'
                ? 'bg-white text-teal-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            °C (Celsius)
          </button>
          <button
            onClick={() => setUnit('F')}
            className={`px-3 py-1.5 rounded-lg transition ${
              unit === 'F'
                ? 'bg-white text-teal-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            °F (Fahrenheit)
          </button>
        </div>
      </div>

      {/* Current Conditions Highlight Banner */}
      <div className="bg-gradient-to-r from-teal-50 via-sky-50 to-emerald-50 rounded-2xl p-4 sm:p-5 border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-5xl drop-shadow-xs">{data.currentIcon}</span>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                {unit === 'C' ? `${data.currentTempC}°C` : `${data.currentTempF}°F`}
              </span>
              <span className="text-sm font-semibold text-slate-700">
                {data.currentDescription}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Current meteorological reading in {data.resolvedLocation.split(',')[0]}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 pt-2 sm:pt-0 border-t sm:border-t-0 border-teal-200/50">
          <div className="flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-sky-500" />
            <span>Rain Risk: {data.days[0]?.precipitationProb ?? 0}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind className="w-4 h-4 text-slate-400" />
            <span>Wind: {data.days[0]?.windSpeedKmh ?? 10} km/h</span>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {data.days.map((day, idx) => {
          const dateObj = new Date(day.date);
          const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const formattedDate = dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
          const maxTemp = unit === 'C' ? `${day.maxTempC}°` : `${day.maxTempF}°`;
          const minTemp = unit === 'C' ? `${day.minTempC}°` : `${day.minTempF}°`;

          return (
            <div
              key={day.date}
              className={`p-3.5 rounded-2xl border flex flex-col justify-between text-center transition hover:shadow-md ${
                idx === 0
                  ? 'bg-teal-50/50 border-teal-200 ring-1 ring-teal-500/20'
                  : 'bg-slate-50/60 border-slate-200/80 hover:bg-white'
              }`}
            >
              <div>
                <p className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  {idx === 0 ? 'Today' : weekday}
                </p>
                <p className="text-[11px] text-slate-500 mb-2">{formattedDate}</p>

                <div className="text-3xl my-1.5" title={day.weatherDescription}>
                  {day.icon}
                </div>

                <p
                  className="text-[11px] font-medium text-slate-700 truncate px-1"
                  title={day.weatherDescription}
                >
                  {day.weatherDescription}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200 space-y-1.5">
                <div className="flex items-center justify-center gap-2 text-xs">
                  <span className="font-extrabold text-slate-900">{maxTemp}</span>
                  <span className="text-slate-400 font-medium">{minTemp}</span>
                </div>

                <div className="flex items-center justify-around text-[10px] text-slate-500 pt-0.5">
                  <span
                    className="flex items-center gap-0.5 font-medium"
                    title="Precipitation Probability"
                  >
                    <Droplets className="w-3 h-3 text-sky-500" />
                    {day.precipitationProb}%
                  </span>
                  <span
                    className="flex items-center gap-0.5 font-medium"
                    title="Wind Speed"
                  >
                    <Wind className="w-3 h-3 text-slate-400" />
                    {day.windSpeedKmh}k/h
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
