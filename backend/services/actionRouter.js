const { getWeather } = require('./weatherService');
const { getSearchResults } = require('./searchService');
const { calculate, getTime, getDate } = require('./informationService');
const { translate } = require('./translationService');

const response = (type, message, data) => ({ type, message, action: { type, data } });

const routeAction = async ({ intent, message }) => {
  if (intent === 'WEATHER') {
    const weatherMatch = String(message).match(/\bweather\s+(?:in|for)\s+(.+)/i);
    const temperatureMatch = String(message).match(/\btemperature\s+(?:in|for)\s+(.+)/i);
    const city = (weatherMatch?.[1] || temperatureMatch?.[1] || '').replace(/\b(today|tomorrow|forecast)\b/ig, '').trim() || process.env.DEFAULT_WEATHER_CITY;
    const weather = await getWeather(city);
    return response('WEATHER', `${weather.city}: ${weather.temperature}°C, ${weather.condition}. Feels like ${weather.feelsLike}°C.`, weather);
  }
  if (intent === 'SEARCH') {
    const query = String(message).replace(/^(search|find|look up)\s+(for\s+)?/i, '').trim();
    const results = await getSearchResults(query);
    return response('SEARCH', results.length ? `I found ${results.length} results for "${query}".` : `I did not find results for "${query}".`, { query, results });
  }
  if (intent === 'CALCULATE') {
    const expression = String(message).replace(/^(calculate|what is|what's)\s+/i, '').trim();
    const value = calculate(expression);
    return response('CALCULATE', `The answer is ${value}.`, { expression, value });
  }
  if (intent === 'TIME') {
    const timezone = String(message).match(/\b(?:in|at)\s+([A-Za-z_]+\/[A-Za-z_]+)\b/i)?.[1] || process.env.APP_TIMEZONE || 'Asia/Kolkata';
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
  return null;
};

module.exports = { routeAction };