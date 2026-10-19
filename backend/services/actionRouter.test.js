const test = require('node:test');
const assert = require('node:assert/strict');
const axios = require('axios');
const { routeAction } = require('./actionRouter');
const { getIntentHandler } = require('../controllers/aiController');

test('classifies supported information and utility intents for action routing', () => {
  for (const intent of [
    'WEB_SEARCH',
    'UNIT_CONVERSION',
    'CURRENCY_CONVERSION',
    'TIME_DATE',
    'LOCATION',
  ]) {
    assert.equal(getIntentHandler(intent), 'action');
  }
  assert.equal(getIntentHandler('CREATE_MEMORY'), 'memory');
  assert.equal(getIntentHandler('GET_MEMORY'), 'memory');
  assert.equal(getIntentHandler('DELETE_MEMORY'), 'memory');
  assert.equal(getIntentHandler('CREATE_TASK'), 'productivity');
  assert.equal(getIntentHandler('UNSUPPORTED_COMMAND'), 'unknown');
});

test('routes unit, currency, time/date, and location requests to their services', async () => {
  const unit = await routeAction({
    intent: 'UNIT_CONVERSION',
    message: 'How many meters are in 5 kilometers?',
  });
  assert.equal(unit.type, 'UNIT_CONVERSION');
  assert.equal(unit.action.data.value, 5);
  assert.equal(unit.action.data.from, 'kilometers');
  assert.equal(unit.action.data.to, 'meters');

  const originalGet = axios.get;
  const originalUrl = process.env.CURRENCY_API_URL;
  process.env.CURRENCY_API_URL = 'https://rates.example/latest/{from}';
  axios.get = async () => ({ data: { result: 'success', rates: { JPY: 150 } } });
  try {
    const currency = await routeAction({
      intent: 'CURRENCY_CONVERSION',
      message: 'Convert 100 EUR to JPY',
    });
    assert.equal(currency.type, 'CURRENCY_CONVERSION');
    assert.equal(currency.action.data.from, 'EUR');
    assert.equal(currency.action.data.to, 'JPY');
    assert.equal(currency.action.data.convertedAmount, 15000);
  } finally {
    axios.get = originalGet;
    if (originalUrl === undefined) delete process.env.CURRENCY_API_URL;
    else process.env.CURRENCY_API_URL = originalUrl;
  }

  const time = await routeAction({ intent: 'TIME_DATE', message: 'What time is it in London?' });
  assert.equal(time.type, 'TIME');
  assert.equal(time.action.data.timezone, 'Europe/London');

  const location = await routeAction({
    intent: 'LOCATION',
    message: 'Where am I?',
    userLocation: { latitude: 51.5, longitude: -0.12, city: 'London' },
  });
  assert.equal(location.type, 'LOCATION');
  assert.equal(location.action.data.location, 'London');
});

test('routes web search through the configured SerpAPI service', async () => {
  const originalGet = axios.get;
  const originalKey = process.env.SEARCH_API_KEY;
  const originalUrl = process.env.SEARCH_API_URL;
  process.env.SEARCH_API_KEY = 'test-serpapi-key';
  delete process.env.SEARCH_API_URL;
  axios.get = async () => ({
    data: {
      organic_results: [{ title: 'AURA official search result', link: 'https://example.com', snippet: 'AURA search summary' }],
    },
  });
  try {
    const result = await routeAction({ intent: 'WEB_SEARCH', message: 'Search the web for AURA' });
    assert.equal(result.type, 'SEARCH');
    assert.equal(result.action.data.query, 'AURA');
    assert.equal(result.action.data.results[0].title, 'AURA official search result');
  } finally {
    axios.get = originalGet;
    if (originalKey === undefined) delete process.env.SEARCH_API_KEY;
    else process.env.SEARCH_API_KEY = originalKey;
    if (originalUrl === undefined) delete process.env.SEARCH_API_URL;
    else process.env.SEARCH_API_URL = originalUrl;
  }
});
