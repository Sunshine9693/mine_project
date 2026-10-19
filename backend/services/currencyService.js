const axios = require('axios');

const CURRENCY_CODES = {
  usd: 'USD',
  dollar: 'USD',
  dollars: 'USD',
  'us dollar': 'USD',
  'us dollars': 'USD',
  inr: 'INR',
  rupee: 'INR',
  rupees: 'INR',
  eur: 'EUR',
  euro: 'EUR',
  euros: 'EUR',
  gbp: 'GBP',
  pound: 'GBP',
  pounds: 'GBP',
  jpy: 'JPY',
  yen: 'JPY',
  cad: 'CAD',
  aud: 'AUD',
  sgd: 'SGD',
  aed: 'AED',
  pkr: 'PKR',
};

const DEFAULT_CURRENCY_API_URL = 'https://open.er-api.com/v6/latest/{from}';

const normalizeCurrency = (currency) => {
  const value = String(currency || '').trim().toLowerCase();
  return CURRENCY_CODES[value] || (/^[a-z]{3}$/i.test(value) ? value.toUpperCase() : null);
};

const currencyError = (message, status, code) =>
  Object.assign(new Error(message), { status, code });

const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  const value = Number(amount);
  const from = normalizeCurrency(fromCurrency);
  const to = normalizeCurrency(toCurrency);

  if (!Number.isFinite(value)) {
    throw currencyError('Please provide a valid amount.', 400, 'CURRENCY_AMOUNT_INVALID');
  }

  if (!from || !to) {
    throw currencyError('Please provide valid currency codes.', 400, 'CURRENCY_INVALID');
  }

  if (from === to) {
    return { amount: value, from, to, rate: 1, convertedAmount: value };
  }

  const configuredUrl = process.env.CURRENCY_API_URL || DEFAULT_CURRENCY_API_URL;
  const apiUrl = configuredUrl.replace('{from}', encodeURIComponent(from));

  let response;
  try {
    response = await axios.get(apiUrl, { timeout: 12000 });
  } catch (error) {
    if (error.response?.status === 429) {
      throw currencyError('Currency conversion is rate limited. Please try again shortly.', 429, 'CURRENCY_RATE_LIMITED');
    }
    if (error.response?.status === 404) {
      throw currencyError('Please provide a supported source currency code.', 400, 'CURRENCY_INVALID');
    }
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throw currencyError('Currency conversion timed out. Please try again.', 504, 'CURRENCY_TIMEOUT');
    }
    throw currencyError('Currency conversion is temporarily unavailable. Please try again.', 502, 'CURRENCY_UNAVAILABLE');
  }

  const data = response.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw currencyError('The exchange-rate service returned invalid data.', 502, 'CURRENCY_INVALID_RESPONSE');
  }
  if (data.result && data.result !== 'success') {
    if (data['error-type'] === 'unsupported-code') {
      throw currencyError('Please provide a supported source currency code.', 400, 'CURRENCY_INVALID');
    }
    throw currencyError('Currency conversion is temporarily unavailable. Please try again.', 502, 'CURRENCY_UNAVAILABLE');
  }
  if (!data.rates || typeof data.rates !== 'object' || Array.isArray(data.rates)) {
    throw currencyError('The exchange-rate service returned invalid data.', 502, 'CURRENCY_INVALID_RESPONSE');
  }

  const rate = data.rates[to];
  if (!Number.isFinite(rate) || rate <= 0) {
    throw currencyError('A rate for that currency pair is unavailable.', 422, 'CURRENCY_RATE_UNAVAILABLE');
  }

  return {
    amount: value,
    from,
    to,
    rate,
    convertedAmount: Number((value * rate).toFixed(2)),
  };
};

module.exports = {
  convertCurrency,
  CURRENCY_CODES,
};
