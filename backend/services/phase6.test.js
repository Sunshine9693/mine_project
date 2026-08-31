const test = require('node:test');
const assert = require('node:assert/strict');
const { detectIntent } = require('./intentService');
const { calculate } = require('./calculatorService');
const { getTime, getDate } = require('./informationService');
const { normalizeCity, resolveWeatherLocation } = require('./weatherService');
const { convertUnit } = require('./unitConverterService');
const { convertCurrency } = require('./currencyService');

test('detects Phase 6 information intents', () => {
  assert.equal(detectIntent('What is the weather in Delhi?'), 'WEATHER');
  assert.equal(detectIntent('Search for latest AI news.'), 'WEB_SEARCH');
  assert.equal(detectIntent('Calculate 25 multiplied by 84.'), 'CALCULATE');
  assert.equal(detectIntent('What time is it in London?'), 'TIME_DATE');
  assert.equal(detectIntent("What is today's date?"), 'DATE');
  assert.equal(detectIntent('Translate hello into French.'), 'TRANSLATE');
  assert.equal(detectIntent('Convert 10 kilometers to miles.'), 'UNIT_CONVERSION');
  assert.equal(detectIntent('Convert 100 USD to INR.'), 'CURRENCY_CONVERSION');
  assert.equal(detectIntent('What is Python?'), 'CHAT');
});

test('calculates supported expressions without executing code', () => {
  assert.equal(calculate('25 multiplied by 84'), 2100);
  assert.equal(calculate('15 percent of 500'), 75);
  assert.equal(calculate('2 to the power of 10'), 1024);
  assert.throws(() => calculate('process.exit()'), /Invalid expression/);
});

test('supports IANA timezones and next weekday dates', () => {
  assert.equal(getTime('Asia/Kolkata').timezone, 'Asia/Kolkata');
  assert.equal(getTime('Europe/London').timezone, 'Europe/London');
  assert.throws(() => getTime('Not/AZone'), /valid IANA timezone/);
  assert.match(getDate('next Monday').iso, /^\d{4}-\d{2}-\d{2}$/);
});

test('normalizes common weather city inputs', () => {
  assert.equal(normalizeCity('can you tell me the weather of Patna today?'), 'Patna');
  assert.equal(normalizeCity('weather of Patna'), 'Patna');
  assert.equal(normalizeCity('what is the weather in Delhi?'), 'Delhi');
  assert.equal(normalizeCity('How is the weather in London today?'), 'London');
  assert.equal(normalizeCity('weather for Tokyo tomorrow'), 'Tokyo');
  assert.equal(normalizeCity('What about New York?'), 'New York');
  assert.equal(normalizeCity(''), '');
});

test('prefers explicit city extraction over fallback location', () => {
  const resolved = resolveWeatherLocation({
    message: 'What is the weather in London today?',
    userLocation: { latitude: 28.6139, longitude: 77.209 },
    fallbackCity: '',
  });

  assert.equal(resolved.location, 'London');
  assert.equal(resolved.explicit, 'London');
});

test('converts supported units and currencies', () => {
  assert.equal(convertUnit(10, 'kilometer', 'mile').toFixed(2), '6.21');
  assert.equal(convertUnit(100, 'fahrenheit', 'celsius').toFixed(2), '37.78');
  assert.equal(convertUnit(2, 'kilogram', 'gram'), 2000);
  const result = convertCurrency(100, 'USD', 'INR');
  assert.ok(result && result.amount === 100 && result.to === 'INR');
});