const test = require('node:test');
const assert = require('node:assert/strict');
const { detectIntent } = require('./intentService');
const { calculate } = require('./calculatorService');
const { getTime, getDate } = require('./informationService');
const { normalizeCity } = require('./weatherService');

test('detects Phase 6 information intents', () => {
  assert.equal(detectIntent('What is the weather in Hyderabad?'), 'WEATHER');
  assert.equal(detectIntent('Search for latest AI news.'), 'SEARCH');
  assert.equal(detectIntent('Calculate 25 multiplied by 84.'), 'CALCULATE');
  assert.equal(detectIntent('What time is it in London?'), 'TIME');
  assert.equal(detectIntent("What is today's date?"), 'DATE');
  assert.equal(detectIntent('Translate hello into French.'), 'TRANSLATE');
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
  assert.equal(normalizeCity("How's the weather in Hyderabad today?"), 'Hyderabad');
  assert.equal(normalizeCity('Hyderabad today?'), 'Hyderabad');
  assert.equal(normalizeCity('weather in Hyderabad'), 'Hyderabad');
  assert.equal(normalizeCity('the weather in Hyderabad today'), 'Hyderabad');
  assert.equal(normalizeCity(''), '');
});