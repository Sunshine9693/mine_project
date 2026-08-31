const { getWeather, resolveWeatherLocation } = require('./weatherService');
const { getSearchResults } = require('./searchService');
const { calculate, getTime, getDate } = require('./informationService');
const { translate } = require('./translationService');
const { convertUnit } = require('./unitConverterService');
const { convertCurrency } = require('./currencyService');

const response = (type, message, data) => ({ type, message, action: { type, data } });

const resolveCityTimezone = (message = '') => {
  const cityMap = {
    hyderabad: 'Asia/Kolkata',
    delhi: 'Asia/Kolkata',
    patna: 'Asia/Kolkata',
    kolkata: 'Asia/Kolkata',
    london: 'Europe/London',
    tokyo: 'Asia/Tokyo',
    paris: 'Europe/Paris',
    newyork: 'America/New_York',
    'new york': 'America/New_York',
    berlin: 'Europe/Berlin',
    dubai: 'Asia/Dubai',
    sydney: 'Australia/Sydney',
  };

  const lower = String(message || '').toLowerCase();
  const match = lower.match(/\b(?:in|at)\s+([a-z\s]+?)(?:\?|$)/i) || lower.match(/\b([a-z\s]+?)\s+(?:today|now|right now|tomorrow)\b/i);
  const city = (match?.[1] || '').trim();
  return cityMap[city] || process.env.APP_TIMEZONE || 'Asia/Kolkata';
};

const parseUnitConversion = (message) => {
  const patterns = [
    /convert\s+(\d+(?:\.\d+)?)\s*([a-zA-Z]+)\s+(?:to|in)\s+([a-zA-Z]+)/i,
    /(\d+(?:\.\d+)?)\s*([a-zA-Z]+)\s+(?:to|in)\s+([a-zA-Z]+)/i,
    /how\s+many\s+([a-zA-Z]+)\s+are\s+in\s+(\d+(?:\.\d+)?)\s*([a-zA-Z]+)/i,
  ];

  for (const pattern of patterns) {
    const match = String(message).match(pattern);
    if (match) {
      if (pattern.source.includes('how many')) {
        return { value: Number(match[2]), from: match[3], to: match[1] };
      }
      return { value: Number(match[1]), from: match[2], to: match[3] };
    }
  }

  return null;
};

const parseCurrencyConversion = (message) => {
  const patterns = [
    /(\d+(?:\.\d+)?)\s*(?:usd|us\s*dollar|dollars?|inr|rupees?|eur|euros?|gbp|pounds?|jpy|yen|cad|aud|sgd|aed|pkr)\s+(?:to|in)\s+(?:usd|us\s*dollar|dollars?|inr|rupees?|eur|euros?|gbp|pounds?|jpy|yen|cad|aud|sgd|aed|pkr)/i,
    /(?:convert|exchange)\s+(\d+(?:\.\d+)?)\s*(?:\$)?\s*([a-zA-Z]+)\s+(?:to|in)\s+([a-zA-Z]+)/i,
  ];

  for (const pattern of patterns) {
    const match = String(message).match(pattern);
    if (match) {
      if (pattern.source.includes('exchange')) {
        return { value: Number(match[1]), from: match[2], to: match[3] };
      }
      const amount = Number(match[1]);
      const from = match[2] || 'USD';
      const to = match[3] || 'INR';
      return { value: amount, from, to };
    }
  }

  const amountMatch = String(message).match(/(\d+(?:\.\d+)?)/);
  const fromMatch = String(message).match(/\b(usd|dollar|dollars|inr|rupee|rupees|eur|euro|euros|gbp|pound|pounds|jpy|yen)\b/i);
  const toMatch = String(message).match(/\b(?:to|in)\s+([a-zA-Z]{3,10})\b/i);
  if (amountMatch && fromMatch && toMatch) {
    return { value: Number(amountMatch[1]), from: fromMatch[1], to: toMatch[1] };
  }

  return null;
};

const routeAction = async ({ intent, message, userLocation = null }) => {
  if (intent === 'WEATHER') {
    const resolvedLocation = resolveWeatherLocation({
      message,
      userLocation,
      fallbackCity: process.env.DEFAULT_WEATHER_CITY,
    });

    console.log('[AURA ActionRouter] User query:', message);
    console.log('[AURA ActionRouter] Extracted location:', resolvedLocation.location || 'none');
    console.log('[AURA ActionRouter] User location provided:', userLocation ? { latitude: userLocation.latitude, longitude: userLocation.longitude } : 'none');

    const weather = await getWeather(resolvedLocation.location || null, userLocation || null);
    return response('WEATHER', `${weather.city}: ${weather.temperature}°C, ${weather.condition}. Feels like ${weather.feelsLike}°C.`, weather);
  }
  if (intent === 'WEB_SEARCH' || intent === 'SEARCH') {
    const query = String(message)
      .replace(/^(?:search|find|look up|search the web)\s+(?:for\s+)?/i, '')
      .replace(/^(?:what\s+is|what's)\s+/i, '')
      .trim();

    const results = await getSearchResults(query);
    return response('SEARCH', results.length ? `I found ${results.length} results for "${query}".` : `I did not find results for "${query}".`, { query, results });
  }
  if (intent === 'CALCULATE') {
    const expression = String(message).replace(/^(calculate|what is|what's|compute)\s+/i, '').trim();
    const value = calculate(expression);
    return response('CALCULATE', `The answer is ${value}.`, { expression, value });
  }
  if (intent === 'TIME' || intent === 'TIME_DATE') {
    const lower = String(message).toLowerCase();
    const asksForDate = /date|day is|today'?s date|what day/i.test(lower);
    if (asksForDate) {
      const date = getDate(message);
      return response('DATE', `It is ${date.date}.`, date);
    }

    const timezone = resolveCityTimezone(message);
    const time = getTime(timezone);
    return response('TIME', `The time in ${time.timezone} is ${time.time}.`, time);
  }
  if (intent === 'DATE') {
    const date = getDate(message);
    return response('DATE', `It is ${date.date}.`, date);
  }
  if (intent === 'TRANSLATE') {
    const match = String(message).match(/(?:translate|say)\s+(.+?)\s+(?:into|to|in)\s+([a-z]+)/i);
    if (!match) throw Object.assign(new Error('Please say what text to translate and the target language.'), { status: 400, code: 'TRANSLATE_INPUT_INVALID' });
    const result = await translate(match[1].trim(), match[2]);
    return response('TRANSLATE', `In ${result.targetLanguage}, that is: ${result.translatedText}`, result);
  }
  if (intent === 'UNIT_CONVERSION') {
    const conversion = parseUnitConversion(message);
    if (!conversion) throw Object.assign(new Error('Please provide a valid unit conversion like 10 kilometers to miles.'), { status: 400, code: 'UNIT_CONVERSION_INVALID' });
    const result = convertUnit(conversion.value, conversion.from, conversion.to);
    return response('UNIT_CONVERSION', `${conversion.value} ${conversion.from} = ${result} ${conversion.to}.`, { value: conversion.value, from: conversion.from, to: conversion.to, result });
  }
  if (intent === 'CURRENCY_CONVERSION') {
    const conversion = parseCurrencyConversion(message);
    if (!conversion) throw Object.assign(new Error('Please provide a valid currency conversion like 100 USD to INR.'), { status: 400, code: 'CURRENCY_CONVERSION_INVALID' });
    const result = await convertCurrency(conversion.value, conversion.from, conversion.to);
    return response('CURRENCY_CONVERSION', `${result.amount} ${result.from} ≈ ${result.convertedAmount} ${result.to}.`, result);
  }
  if (intent === 'LOCATION') {
    if (userLocation && Number.isFinite(userLocation.latitude) && Number.isFinite(userLocation.longitude)) {
      const locationLabel = userLocation.city || userLocation.name || 'Current location';
      return response('LOCATION', `Your current location is ${locationLabel}. Coordinates: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}.`, { location: locationLabel, latitude: userLocation.latitude, longitude: userLocation.longitude });
    }
    return response('LOCATION', 'I can use your current browser location if you allow it, or you can tell me a city to use instead.', { permissionRequired: true });
  }
  return null;
};

module.exports = { routeAction };