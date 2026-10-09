const axios = require('axios');

const CURRENCY_CODES = {
  usd: 'USD',
  dollar: 'USD',
  dollars: 'USD',
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

const FALLBACK_EXCHANGE_RATES = {
  USD: { USD: 1, INR: 83.2, EUR: 0.92, GBP: 0.78, JPY: 157.0, CAD: 1.36, AUD: 1.51, SGD: 1.35, AED: 3.67, PKR: 278.4 },
  INR: { USD: 1 / 83.2, INR: 1, EUR: 0.01105, GBP: 0.00938, JPY: 1.886, CAD: 0.01635, AUD: 0.01815, SGD: 0.01625, AED: 0.0441, PKR: 3.35 },
  EUR: { USD: 1.087, INR: 90.7, EUR: 1, GBP: 0.85, JPY: 171.4, CAD: 1.48, AUD: 1.64, SGD: 1.47, AED: 3.99, PKR: 302.8 },
  GBP: { USD: 1.28, INR: 106.7, EUR: 1.18, GBP: 1, JPY: 201.4, CAD: 1.74, AUD: 1.94, SGD: 1.73, AED: 4.7, PKR: 356.2 },
  JPY: { USD: 0.00637, INR: 0.53, EUR: 0.00584, GBP: 0.00496, JPY: 1, CAD: 0.00866, AUD: 0.00962, SGD: 0.00861, AED: 0.0234, PKR: 1.77 },
  CAD: { USD: 0.74, INR: 61.4, EUR: 0.68, GBP: 0.57, JPY: 115.4, CAD: 1, AUD: 1.11, SGD: 0.99, AED: 2.70, PKR: 204.6 },
  AUD: { USD: 0.66, INR: 55.2, EUR: 0.61, GBP: 0.52, JPY: 103.9, CAD: 0.90, AUD: 1, SGD: 0.89, AED: 2.43, PKR: 184.1 },
  SGD: { USD: 0.74, INR: 61.6, EUR: 0.68, GBP: 0.58, JPY: 116.2, CAD: 1.01, AUD: 1.12, SGD: 1, AED: 2.71, PKR: 205.9 },
  AED: { USD: 0.27, INR: 22.7, EUR: 0.25, GBP: 0.21, JPY: 42.7, CAD: 0.37, AUD: 0.41, SGD: 0.37, AED: 1, PKR: 75.9 },
  PKR: { USD: 0.00359, INR: 0.299, EUR: 0.00330, GBP: 0.00281, JPY: 0.565, CAD: 0.00489, AUD: 0.00543, SGD: 0.00486, AED: 0.0132, PKR: 1 },
};

const normalizeCurrency = (currency) => {
  const value = String(currency || '').trim().toLowerCase();

  return CURRENCY_CODES[value] || (
    /^[a-z]{3}$/i.test(value) ? value.toUpperCase() : null
  );
};

const getFallbackRate = (from, to) => {
  if (from === to) return 1;
  return Number.isFinite(FALLBACK_EXCHANGE_RATES[from]?.[to])
    ? FALLBACK_EXCHANGE_RATES[from][to]
    : null;
};

const convertCurrency = (amount, fromCurrency, toCurrency) => {
  const value = Number(amount);
  const from = normalizeCurrency(fromCurrency);
  const to = normalizeCurrency(toCurrency);

  if (!Number.isFinite(value)) {
    throw Object.assign(
      new Error('Please provide a valid amount.'),
      { status: 400, code: 'CURRENCY_AMOUNT_INVALID' }
    );
  }

  if (!from || !to) {
    throw Object.assign(
      new Error('Please provide valid currency codes.'),
      { status: 400, code: 'CURRENCY_INVALID' }
    );
  }

  if (from === to) {
    return {
      amount: value,
      from,
      to,
      rate: 1,
      convertedAmount: value,
    };
  }

  const fallbackRate = getFallbackRate(from, to);
  if (Number.isFinite(fallbackRate)) {
    return {
      amount: value,
      from,
      to,
      rate: fallbackRate,
      convertedAmount: Number((value * fallbackRate).toFixed(2)),
    };
  }

  const apiUrl = process.env.CURRENCY_API_URL || `https://open.er-api.com/v6/latest/${from}`;
  axios.get(apiUrl, { timeout: 12000 })
    .then((response) => {
      const liveRate = response.data?.rates?.[to];
      if (Number.isFinite(liveRate)) {
        const formatted = Number((value * liveRate).toFixed(2));
        console.log('[AURA CurrencyService] live rate fetched for', from, to, liveRate, formatted);
      }
    })
    .catch(() => {
      // Ignore background refresh failures and keep the synchronous fallback result.
    });

  throw Object.assign(
    new Error('Currency conversion is temporarily unavailable. Please try again.'),
    { status: 502, code: 'CURRENCY_UNAVAILABLE' }
  );
};

module.exports = {
  convertCurrency,
  CURRENCY_CODES,
};