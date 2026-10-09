import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calculator,
  CircleDollarSign,
  Ruler,
  CloudSun,
  Clock3,
  Languages,
  Search,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles,
  MapPin
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import api from '../services/api';

const utilityDefinitions = [
  {
    key: 'calculator',
    title: 'Calculator',
    description: 'Solve arithmetic and quick expressions using the live backend calculator.',
    icon: Calculator,
  },
  {
    key: 'currency',
    title: 'Currency Converter',
    description: 'Convert between global currencies using the live exchange service.',
    icon: CircleDollarSign,
  },
  {
    key: 'unit',
    title: 'Unit Converter',
    description: 'Convert length, weight, temperature, and time units instantly.',
    icon: Ruler,
  },
  {
    key: 'weather',
    title: 'Weather',
    description: 'Check real-time conditions for any city around the world.',
    icon: CloudSun,
  },
  {
    key: 'time',
    title: 'World Time',
    description: 'Discover live local time across cities and time zones.',
    icon: Clock3,
  },
  {
    key: 'translator',
    title: 'Translator',
    description: 'Translate text to real languages with the connected backend service.',
    icon: Languages,
  },
  {
    key: 'search',
    title: 'Web Search',
    description: 'Run a real web query and open the most relevant results.',
    icon: Search,
  },
];

const currencyOptions = ['USD', 'INR', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'SGD', 'AED', 'PKR'];
const languageOptions = [
  { label: 'Hindi', value: 'hi' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Tamil', value: 'ta' },
  { label: 'Telugu', value: 'te' },
  { label: 'Bengali', value: 'bn' },
];

const unitOptions = {
  length: ['meter', 'kilometer', 'mile', 'yard', 'foot', 'inch'],
  weight: ['kilogram', 'gram', 'pound', 'ounce'],
  temperature: ['celsius', 'fahrenheit', 'kelvin'],
  time: ['second', 'minute', 'hour', 'day'],
};

const cityTimezones = {
  London: 'Europe/London',
  Tokyo: 'Asia/Tokyo',
  'New York': 'America/New_York',
  Dubai: 'Asia/Dubai',
  Hyderabad: 'Asia/Kolkata',
  Paris: 'Europe/Paris',
  Berlin: 'Europe/Berlin',
  Sydney: 'Australia/Sydney',
};

const makeErrorMessage = (error) => {
  const rawMessage = error?.response?.data?.message || error?.message || 'Something went wrong while processing the request.';
  const message = String(rawMessage).trim();

  if (message.toLowerCase().includes('search service is not configured')) {
    return 'Web search is not configured yet. Add the required search API credentials to backend/.env.';
  }

  if (message.toLowerCase().includes('currency service is not configured')) {
    return 'Currency service is not configured yet. Add the required API credentials to backend/.env.';
  }

  return message || 'Something went wrong while processing the request.';
};

const getUTCOffset = (timezone) => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(new Date());

    const zoneName = parts.find((part) => part.type === 'timeZoneName')?.value || 'UTC';
    return zoneName.replace('GMT', 'UTC');
  } catch {
    return 'UTC';
  }
};

const UtilitiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTool, setActiveTool] = useState(searchParams.get('tool') || 'calculator');

  const [calculatorExpression, setCalculatorExpression] = useState('25 * 8');
  const [calculatorResult, setCalculatorResult] = useState(null);
  const [currencyForm, setCurrencyForm] = useState({ amount: '100', from: 'USD', to: 'INR' });
  const [currencyResult, setCurrencyResult] = useState(null);
  const [unitForm, setUnitForm] = useState({ value: '5', category: 'length', from: 'kilometer', to: 'mile' });
  const [unitResult, setUnitResult] = useState(null);
  const [weatherCity, setWeatherCity] = useState('Hyderabad');
  const [weatherResult, setWeatherResult] = useState(null);
  const [timeCity, setTimeCity] = useState('London');
  const [timeResult, setTimeResult] = useState(null);
  const [translationText, setTranslationText] = useState('Hello');
  const [translationTarget, setTranslationTarget] = useState('hi');
  const [translationResult, setTranslationResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState('latest AI news');
  const [searchResult, setSearchResult] = useState(null);

  const [statuses, setStatuses] = useState({
    calculator: { loading: false, error: '' },
    currency: { loading: false, error: '' },
    unit: { loading: false, error: '' },
    weather: { loading: false, error: '' },
    time: { loading: false, error: '' },
    translator: { loading: false, error: '' },
    search: { loading: false, error: '' },
  });

  const selectedUtility = useMemo(
    () => utilityDefinitions.find((item) => item.key === activeTool) || utilityDefinitions[0],
    [activeTool]
  );

  useEffect(() => {
    const requestedTool = searchParams.get('tool');
    if (requestedTool && utilityDefinitions.some((item) => item.key === requestedTool)) {
      setActiveTool(requestedTool);
    }
  }, [searchParams]);

  const updateStatus = (key, patch) => {
    setStatuses((previous) => ({
      ...previous,
      [key]: {
        ...previous[key],
        ...patch,
      },
    }));
  };

  const handleSelectTool = (toolKey) => {
    setActiveTool(toolKey);
    setSearchParams({ tool: toolKey });
  };

  const handleCalculator = async () => {
    const expression = String(calculatorExpression || '').trim();
    if (!expression) {
      updateStatus('calculator', { error: 'Please enter an expression to calculate.' });
      return;
    }

    updateStatus('calculator', { loading: true, error: '' });

    try {
      const { data } = await api.post('/utilities/calculate', { expression });
      const numericValue = Number(data.result);
      setCalculatorResult({ expression, result: Number.isFinite(numericValue) ? numericValue : data.result });
      updateStatus('calculator', { loading: false, error: '' });
    } catch (error) {
      updateStatus('calculator', { loading: false, error: makeErrorMessage(error) });
    }
  };

  const handleCurrency = async () => {
    const amount = Number(currencyForm.amount);
    if (!Number.isFinite(amount)) {
      updateStatus('currency', { error: 'Please enter a valid amount.' });
      return;
    }

    updateStatus('currency', { loading: true, error: '' });

    try {
      const { data } = await api.post('/utilities/currency', {
        amount,
        from: currencyForm.from,
        to: currencyForm.to,
      });

      setCurrencyResult(data);
      updateStatus('currency', { loading: false, error: '' });
    } catch (error) {
      updateStatus('currency', { loading: false, error: makeErrorMessage(error) });
    }
  };

  const handleUnitConvert = async () => {
    const value = Number(unitForm.value);
    if (!Number.isFinite(value)) {
      updateStatus('unit', { error: 'Please enter a valid numeric value.' });
      return;
    }

    updateStatus('unit', { loading: true, error: '' });

    try {
      const { data } = await api.post('/utilities/convert', {
        value,
        from: unitForm.from,
        to: unitForm.to,
      });

      setUnitResult(data);
      updateStatus('unit', { loading: false, error: '' });
    } catch (error) {
      updateStatus('unit', { loading: false, error: makeErrorMessage(error) });
    }
  };

  const handleWeather = async () => {
    const city = String(weatherCity || '').trim();
    if (!city) {
      updateStatus('weather', { error: 'Please enter a city name.' });
      return;
    }

    updateStatus('weather', { loading: true, error: '' });

    try {
      const { data } = await api.get('/utilities/weather', { params: { city } });
      setWeatherResult(data.weather);
      updateStatus('weather', { loading: false, error: '' });
    } catch (error) {
      updateStatus('weather', { loading: false, error: makeErrorMessage(error) });
    }
  };

  const handleTime = async () => {
    const city = String(timeCity || '').trim();
    const timezone = cityTimezones[city] || city;

    if (!timezone) {
      updateStatus('time', { error: 'Please enter a valid city or timezone.' });
      return;
    }

    updateStatus('time', { loading: true, error: '' });

    try {
      const { data } = await api.get('/utilities/time', { params: { timezone } });
      setTimeResult({ ...data.time, city, timezone: data.time?.timezone || timezone });
      updateStatus('time', { loading: false, error: '' });
    } catch (error) {
      updateStatus('time', { loading: false, error: makeErrorMessage(error) });
    }
  };

  const handleTranslation = async () => {
    const text = String(translationText || '').trim();
    if (!text) {
      updateStatus('translator', { error: 'Please enter text to translate.' });
      return;
    }

    updateStatus('translator', { loading: true, error: '' });

    try {
      const { data } = await api.post('/utilities/translate', {
        text,
        targetLanguage: translationTarget,
      });

      setTranslationResult(data);
      updateStatus('translator', { loading: false, error: '' });
    } catch (error) {
      updateStatus('translator', { loading: false, error: makeErrorMessage(error) });
    }
  };

  const handleSearch = async () => {
    const query = String(searchQuery || '').trim();
    if (!query) {
      updateStatus('search', { error: 'Please enter a search query.' });
      return;
    }

    updateStatus('search', { loading: true, error: '' });

    try {
      const { data } = await api.get('/utilities/search', { params: { q: query } });
      setSearchResult(data.results || []);
      updateStatus('search', { loading: false, error: '' });
    } catch (error) {
      updateStatus('search', { loading: false, error: makeErrorMessage(error) });
    }
  };

  const renderStatus = (key) => {
    const status = statuses[key];
    if (!status) return null;

    if (status.loading) {
      return (
        <div className="flex items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm text-violet-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading live result...
        </div>
      );
    }

    if (status.error) {
      return (
        <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{status.error}</span>
        </div>
      );
    }

    return null;
  };

  const activeUtilityName = selectedUtility.title;

  return (
    <div className="flex-1 flex flex-col gap-6 min-h-[calc(100vh-2rem)] py-2">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-aura-primary-purple">
          <Sparkles className="h-4 w-4" />
          Smart Utilities
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-aura-text-primary">Smart Utilities</h1>
        <p className="max-w-2xl text-sm md:text-base text-aura-text-secondary">
          Powerful tools for calculations, conversions, real-time information and search.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {utilityDefinitions.map((item) => {
          const Icon = item.icon;
          const isActive = activeTool === item.key;

          return (
            <GlassCard
              key={item.key}
              hover
              onClick={() => handleSelectTool(item.key)}
              className={`cursor-pointer border ${isActive ? 'border-violet-300 bg-violet-50/80' : 'border-white/60'} p-4`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-aura-lavender/70 text-aura-deep-purple">
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowRight className="mt-1 h-4 w-4 text-aura-text-muted" />
              </div>
              <div className="mt-4 space-y-2">
                <h3 className="text-base font-semibold text-aura-text-primary">{item.title}</h3>
                <p className="text-sm leading-relaxed text-aura-text-secondary">{item.description}</p>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard className="border border-white/60 p-5 md:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-aura-lavender/70 text-aura-deep-purple">
              {React.createElement(selectedUtility.icon, { className: 'h-5 w-5' })}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-aura-text-muted">Utility</p>
              <h2 className="text-xl font-semibold text-aura-text-primary">{activeUtilityName}</h2>
            </div>
          </div>
        </div>

        {activeTool === 'calculator' && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.16em] text-aura-text-muted">Expression</label>
                <input
                  value={calculatorExpression}
                  onChange={(event) => setCalculatorExpression(event.target.value)}
                  placeholder="25 * 8"
                  className="glass-input w-full rounded-2xl border border-white/70 px-4 py-3 text-sm text-aura-text-primary outline-none transition focus:border-violet-300"
                />
              </div>
              <button
                onClick={handleCalculator}
                className="btn-gradient-purple rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
              >
                Calculate
              </button>
            </div>

            {renderStatus('calculator')}

            {calculatorResult ? (
              <div className="rounded-[24px] border border-violet-200 bg-violet-50/60 p-5">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-aura-text-muted">Expression</div>
                <div className="mt-2 text-xl font-semibold text-aura-text-primary">{calculatorResult.expression}</div>
                <div className="mt-6 flex items-end gap-2 text-aura-text-primary">
                  <span className="text-2xl font-semibold">=</span>
                  <span className="text-3xl font-bold text-aura-deep-purple">{Number(calculatorResult.result).toLocaleString(undefined, { maximumFractionDigits: 10 })}</span>
                </div>
              </div>
            ) : (
              <div className="rounded-[22px] border border-dashed border-white/60 bg-white/20 p-5 text-sm text-aura-text-secondary">
                Enter an expression like 25 * 8 to calculate the result.
              </div>
            )}
          </div>
        )}

        {activeTool === 'currency' && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2 md:col-span-1">
                <label className="text-xs font-medium uppercase tracking-[0.16em] text-aura-text-muted">Amount</label>
                <input
                  type="number"
                  value={currencyForm.amount}
                  onChange={(event) => setCurrencyForm((previous) => ({ ...previous, amount: event.target.value }))}
                  className="glass-input w-full rounded-2xl border border-white/70 px-4 py-3 text-sm text-aura-text-primary outline-none transition focus:border-violet-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.16em] text-aura-text-muted">From</label>
                <select
                  value={currencyForm.from}
                  onChange={(event) => setCurrencyForm((previous) => ({ ...previous, from: event.target.value }))}
                  className="glass-input w-full rounded-2xl border border-white/70 px-4 py-3 text-sm text-aura-text-primary outline-none transition focus:border-violet-300"
                >
                  {currencyOptions.map((currency) => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.16em] text-aura-text-muted">To</label>
                <select
                  value={currencyForm.to}
                  onChange={(event) => setCurrencyForm((previous) => ({ ...previous, to: event.target.value }))}
                  className="glass-input w-full rounded-2xl border border-white/70 px-4 py-3 text-sm text-aura-text-primary outline-none transition focus:border-violet-300"
                >
                  {currencyOptions.map((currency) => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleCurrency}
                  className="btn-gradient-purple w-full rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
                >
                  Convert
                </button>
              </div>
            </div>

            {renderStatus('currency')}

            {currencyResult ? (
              <div className="rounded-[24px] border border-violet-200 bg-violet-50/60 p-5">
                <div className="flex items-center justify-center gap-2 text-xl font-semibold text-aura-text-primary md:text-2xl">
                  <span>{currencyResult.amount} {currencyResult.from}</span>
                  <span className="text-aura-text-muted">≈</span>
                  <span>{currencyResult.convertedAmount} {currencyResult.to}</span>
                </div>
                {currencyResult.rate && (
                  <div className="mt-4 text-sm text-aura-text-secondary">
                    Rate: 1 {currencyResult.from} = {Number(currencyResult.rate).toFixed(4)} {currencyResult.to}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-[22px] border border-dashed border-white/60 bg-white/20 p-5 text-sm text-aura-text-secondary">
                Convert 100 USD to INR using the connected exchange rate service.
              </div>
            )}
          </div>
        )}

        {activeTool === 'unit' && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-5">
              <div className="space-y-2 md:col-span-1">
                <label className="text-xs font-medium uppercase tracking-[0.16em] text-aura-text-muted">Value</label>
                <input
                  type="number"
                  value={unitForm.value}
                  onChange={(event) => setUnitForm((previous) => ({ ...previous, value: event.target.value }))}
                  className="glass-input w-full rounded-2xl border border-white/70 px-4 py-3 text-sm text-aura-text-primary outline-none transition focus:border-violet-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.16em] text-aura-text-muted">Category</label>
                <select
                  value={unitForm.category}
                  onChange={(event) => {
                    const nextCategory = event.target.value;
                    const nextOptions = unitOptions[nextCategory] || [];
                    setUnitForm((previous) => ({
                      ...previous,
                      category: nextCategory,
                      from: nextOptions[0] || previous.from,
                      to: nextOptions[1] || previous.to,
                    }));
                  }}
                  className="glass-input w-full rounded-2xl border border-white/70 px-4 py-3 text-sm text-aura-text-primary outline-none transition focus:border-violet-300"
                >
                  {Object.keys(unitOptions).map((category) => (
                    <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.16em] text-aura-text-muted">From</label>
                <select
                  value={unitForm.from}
                  onChange={(event) => setUnitForm((previous) => ({ ...previous, from: event.target.value }))}
                  className="glass-input w-full rounded-2xl border border-white/70 px-4 py-3 text-sm text-aura-text-primary outline-none transition focus:border-violet-300"
                >
                  {(unitOptions[unitForm.category] || []).map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.16em] text-aura-text-muted">To</label>
                <select
                  value={unitForm.to}
                  onChange={(event) => setUnitForm((previous) => ({ ...previous, to: event.target.value }))}
                  className="glass-input w-full rounded-2xl border border-white/70 px-4 py-3 text-sm text-aura-text-primary outline-none transition focus:border-violet-300"
                >
                  {(unitOptions[unitForm.category] || []).map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleUnitConvert}
                  className="btn-gradient-purple w-full rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
                >
                  Convert
                </button>
              </div>
            </div>

            {renderStatus('unit')}

            {unitResult ? (
              <div className="rounded-[24px] border border-violet-200 bg-violet-50/60 p-5">
                <div className="text-xl font-semibold text-aura-text-primary md:text-2xl">
                  {unitResult.value} {unitResult.from} → {unitResult.to}
                </div>
                <div className="mt-3 text-3xl font-bold text-aura-deep-purple">{Number(unitResult.result).toLocaleString(undefined, { maximumFractionDigits: 10 })}</div>
              </div>
            ) : (
              <div className="rounded-[22px] border border-dashed border-white/60 bg-white/20 p-5 text-sm text-aura-text-secondary">
                Try 5 km → miles or 100 °C → °F.
              </div>
            )}
          </div>
        )}

        {activeTool === 'weather' && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.16em] text-aura-text-muted">City</label>
                <input
                  value={weatherCity}
                  onChange={(event) => setWeatherCity(event.target.value)}
                  placeholder="Hyderabad"
                  className="glass-input w-full rounded-2xl border border-white/70 px-4 py-3 text-sm text-aura-text-primary outline-none transition focus:border-violet-300"
                />
              </div>
              <button
                onClick={handleWeather}
                className="btn-gradient-purple rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
              >
                Get Weather
              </button>
            </div>

            {renderStatus('weather')}

            {weatherResult ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] border border-violet-200 bg-violet-50/60 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.14em] text-aura-text-muted">
                    <MapPin className="h-4 w-4" />
                    City
                  </div>
                  <div className="mt-3 text-2xl font-semibold text-aura-text-primary">{weatherResult.city}</div>
                  <div className="mt-2 text-sm text-aura-text-secondary">{weatherResult.country || 'Current location'}</div>
                </div>
                <div className="rounded-[24px] border border-violet-200 bg-violet-50/60 p-5">
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-aura-text-muted">Temperature</div>
                  <div className="mt-3 text-3xl font-bold text-aura-deep-purple">{weatherResult.temperature}°C</div>
                  <div className="mt-2 text-sm text-aura-text-secondary">Feels Like {weatherResult.feelsLike}°C</div>
                </div>
                <div className="rounded-[24px] border border-violet-200 bg-violet-50/60 p-5">
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-aura-text-muted">Condition</div>
                  <div className="mt-3 text-xl font-semibold text-aura-text-primary">{weatherResult.condition}</div>
                </div>
                <div className="rounded-[24px] border border-violet-200 bg-violet-50/60 p-5">
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-aura-text-muted">Wind Speed</div>
                  <div className="mt-3 text-xl font-semibold text-aura-text-primary">{weatherResult.windSpeed || weatherResult.wind} km/h</div>
                </div>
                <div className="rounded-[24px] border border-violet-200 bg-violet-50/60 p-5">
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-aura-text-muted">Humidity</div>
                  <div className="mt-3 text-xl font-semibold text-aura-text-primary">{weatherResult.humidity}%</div>
                </div>
              </div>
            ) : (
              <div className="rounded-[22px] border border-dashed border-white/60 bg-white/20 p-5 text-sm text-aura-text-secondary">
                Search for a city like Hyderabad or London to load the real weather report.
              </div>
            )}
          </div>
        )}

        {activeTool === 'time' && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.16em] text-aura-text-muted">City / Location</label>
                <input
                  value={timeCity}
                  onChange={(event) => setTimeCity(event.target.value)}
                  placeholder="London"
                  className="glass-input w-full rounded-2xl border border-white/70 px-4 py-3 text-sm text-aura-text-primary outline-none transition focus:border-violet-300"
                />
              </div>
              <button
                onClick={handleTime}
                className="btn-gradient-purple rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
              >
                Check Time
              </button>
            </div>

            {renderStatus('time')}

            {timeResult ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] border border-violet-200 bg-violet-50/60 p-5">
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-aura-text-muted">City</div>
                  <div className="mt-3 text-2xl font-semibold text-aura-text-primary">{timeResult.city}</div>
                </div>
                <div className="rounded-[24px] border border-violet-200 bg-violet-50/60 p-5">
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-aura-text-muted">Timezone</div>
                  <div className="mt-3 text-xl font-semibold text-aura-text-primary">{timeResult.timezone}</div>
                </div>
                <div className="rounded-[24px] border border-violet-200 bg-violet-50/60 p-5">
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-aura-text-muted">Local Date</div>
                  <div className="mt-3 text-xl font-semibold text-aura-text-primary">{timeResult.date}</div>
                </div>
                <div className="rounded-[24px] border border-violet-200 bg-violet-50/60 p-5">
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-aura-text-muted">Local Time</div>
                  <div className="mt-3 text-xl font-semibold text-aura-text-primary">{timeResult.time}</div>
                </div>
                <div className="rounded-[24px] border border-violet-200 bg-violet-50/60 p-5 md:col-span-2">
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-aura-text-muted">UTC Offset</div>
                  <div className="mt-3 text-xl font-semibold text-aura-text-primary">{getUTCOffset(timeResult.timezone)}</div>
                </div>
              </div>
            ) : (
              <div className="rounded-[22px] border border-dashed border-white/60 bg-white/20 p-5 text-sm text-aura-text-secondary">
                Check live local time for London, Tokyo, New York, Dubai, or Hyderabad.
              </div>
            )}
          </div>
        )}

        {activeTool === 'translator' && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.16em] text-aura-text-muted">Text</label>
                <input
                  value={translationText}
                  onChange={(event) => setTranslationText(event.target.value)}
                  placeholder="Hello"
                  className="glass-input w-full rounded-2xl border border-white/70 px-4 py-3 text-sm text-aura-text-primary outline-none transition focus:border-violet-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.16em] text-aura-text-muted">Target Language</label>
                <select
                  value={translationTarget}
                  onChange={(event) => setTranslationTarget(event.target.value)}
                  className="glass-input w-full rounded-2xl border border-white/70 px-4 py-3 text-sm text-aura-text-primary outline-none transition focus:border-violet-300"
                >
                  {languageOptions.map((language) => (
                    <option key={language.value} value={language.value}>{language.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleTranslation}
                className="btn-gradient-purple rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
              >
                Translate
              </button>
            </div>

            {renderStatus('translator')}

            {translationResult ? (
              <div className="rounded-[24px] border border-violet-200 bg-violet-50/60 p-5">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-aura-text-muted">Original</div>
                <div className="mt-2 text-lg font-medium text-aura-text-primary">{translationResult.originalText}</div>
                <div className="mt-5 text-xs font-medium uppercase tracking-[0.18em] text-aura-text-muted">Translated</div>
                <div className="mt-2 text-2xl font-bold text-aura-deep-purple">{translationResult.translatedText}</div>
              </div>
            ) : (
              <div className="rounded-[22px] border border-dashed border-white/60 bg-white/20 p-5 text-sm text-aura-text-secondary">
                Translate Hello into Hindi or another supported language.
              </div>
            )}
          </div>
        )}

        {activeTool === 'search' && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.16em] text-aura-text-muted">Search the web</label>
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="latest AI news"
                  className="glass-input w-full rounded-2xl border border-white/70 px-4 py-3 text-sm text-aura-text-primary outline-none transition focus:border-violet-300"
                />
              </div>
              <button
                onClick={handleSearch}
                className="btn-gradient-purple rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
              >
                Search
              </button>
            </div>

            {renderStatus('search')}

            {searchResult && searchResult.length > 0 ? (
              <div className="space-y-3">
                {searchResult.map((result, index) => (
                  <div key={`${result.title}-${index}`} className="rounded-[22px] border border-white/70 bg-white/20 p-4">
                    <div className="text-lg font-semibold text-aura-text-primary">{result.title}</div>
                    <div className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-aura-text-muted">{result.source}</div>
                    <p className="mt-2 text-sm leading-relaxed text-aura-text-secondary">{result.snippet || result.description}</p>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-aura-primary-purple"
                    >
                      Open Result <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[22px] border border-dashed border-white/60 bg-white/20 p-5 text-sm text-aura-text-secondary">
                Search real web results for the latest AI news or any topic you need.
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default UtilitiesPage;
