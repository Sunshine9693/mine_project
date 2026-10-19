const test = require('node:test');
const assert = require('node:assert/strict');
const axios = require('axios');
const { convertCurrency } = require('./currencyService');

test('uses live rate data and expands the configured base-currency URL', async () => {
  const originalGet = axios.get;
  const originalUrl = process.env.CURRENCY_API_URL;
  let request;
  process.env.CURRENCY_API_URL = 'https://rates.example/latest/{from}';
  axios.get = async (...args) => {
    request = args;
    return { data: { result: 'success', rates: { EUR: 0.92 } } };
  };
  try {
    const result = await convertCurrency(10, 'USD', 'EUR');
    assert.equal(request[0], 'https://rates.example/latest/USD');
    assert.equal(request[1].timeout, 12000);
    assert.deepEqual(result, {
      amount: 10,
      from: 'USD',
      to: 'EUR',
      rate: 0.92,
      convertedAmount: 9.2,
    });
  } finally {
    axios.get = originalGet;
    if (originalUrl === undefined) delete process.env.CURRENCY_API_URL;
    else process.env.CURRENCY_API_URL = originalUrl;
  }
});

test('validates amount and currency inputs without making a request', async () => {
  await assert.rejects(convertCurrency('not a number', 'USD', 'EUR'), { code: 'CURRENCY_AMOUNT_INVALID', status: 400 });
  await assert.rejects(convertCurrency(10, 'USDX', 'EUR'), { code: 'CURRENCY_INVALID', status: 400 });
  assert.deepEqual(await convertCurrency(10, 'USD', 'USD'), {
    amount: 10,
    from: 'USD',
    to: 'USD',
    rate: 1,
    convertedAmount: 10,
  });
});

test('surfaces provider timeouts and missing exchange rates', async () => {
  const originalGet = axios.get;
  axios.get = async () => {
    const error = new Error('timeout');
    error.code = 'ECONNABORTED';
    throw error;
  };
  try {
    await assert.rejects(convertCurrency(10, 'USD', 'EUR'), { code: 'CURRENCY_TIMEOUT', status: 504 });
    axios.get = async () => ({ data: { result: 'success', rates: {} } });
    await assert.rejects(convertCurrency(10, 'USD', 'EUR'), { code: 'CURRENCY_RATE_UNAVAILABLE', status: 422 });
  } finally {
    axios.get = originalGet;
  }
});

test('rejects unsupported currency codes reported by the exchange-rate provider', async () => {
  const originalGet = axios.get;
  axios.get = async () => ({
    data: { result: 'error', 'error-type': 'unsupported-code' },
  });
  try {
    await assert.rejects(convertCurrency(10, 'ZZZ', 'EUR'), {
      code: 'CURRENCY_INVALID',
      status: 400,
    });
  } finally {
    axios.get = originalGet;
  }
});
