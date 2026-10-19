const axios = require('axios');

const LANGUAGE_CODES = {
  english: 'EN',
  hindi: 'HI',
  french: 'FR',
  urdu: 'UR',
  spanish: 'ES',
  german: 'DE',
  tamil: 'TA',
  telugu: 'TE',
  bengali: 'BN',
};
const SUPPORTED_LANGUAGE_CODES = new Set(Object.values(LANGUAGE_CODES));
const MAX_REQUEST_BYTES = 100 * 1024;

const createTranslationError = (message, status, code) => Object.assign(
  new Error(message),
  { status, code },
);

const normalizeLanguage = (language, { allowAuto = false } = {}) => {
  const value = String(language || '').trim().toLowerCase();
  if (allowAuto && (!value || value === 'auto')) return null;

  const code = LANGUAGE_CODES[value] || value.toUpperCase();
  if (!SUPPORTED_LANGUAGE_CODES.has(code)) {
    throw createTranslationError(
      'Please choose a supported source and target language.',
      400,
      'TRANSLATE_LANGUAGE_INVALID',
    );
  }
  return code;
};

const translate = async (text, targetLanguage, sourceLanguage = 'auto') => {
  if (typeof text !== 'string' || !text.trim()) {
    throw createTranslationError('Text to translate is required.', 400, 'TRANSLATE_TEXT_REQUIRED');
  }

  const targetCode = normalizeLanguage(targetLanguage);
  const sourceCode = normalizeLanguage(sourceLanguage, { allowAuto: true });
  if (sourceCode && sourceCode === targetCode) {
    throw createTranslationError(
      'Choose different source and target languages.',
      400,
      'TRANSLATE_LANGUAGES_MATCH',
    );
  }

  const apiUrl = process.env.TRANSLATION_API_URL?.trim();
  const apiKey = process.env.TRANSLATION_API_KEY?.trim();
  if (!apiUrl || !apiKey) {
    throw createTranslationError(
      'Translation is not configured. Set TRANSLATION_API_URL and TRANSLATION_API_KEY in backend/.env.',
      503,
      'TRANSLATE_NOT_CONFIGURED',
    );
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(apiUrl);
  } catch {
    throw createTranslationError('The translation service URL is invalid.', 503, 'TRANSLATE_CONFIGURATION_INVALID');
  }

  if (
    parsedUrl.protocol !== 'https:'
    || !['api.deepl.com', 'api-free.deepl.com'].includes(parsedUrl.hostname)
    || parsedUrl.pathname !== '/v2/translate'
  ) {
    throw createTranslationError(
      'Set TRANSLATION_API_URL to the DeepL API /v2/translate endpoint for your plan.',
      503,
      'TRANSLATE_CONFIGURATION_INVALID',
    );
  }

  const requestBody = {
    text: [text],
    target_lang: targetCode,
    ...(sourceCode ? { source_lang: sourceCode } : {}),
  };
  if (Buffer.byteLength(JSON.stringify(requestBody), 'utf8') > MAX_REQUEST_BYTES) {
    throw createTranslationError(
      'Text is too long to translate in one request. Please shorten it and try again.',
      413,
      'TRANSLATE_TEXT_TOO_LONG',
    );
  }

  try {
    const response = await axios.post(apiUrl, requestBody, {
      timeout: 15000,
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    const translation = response.data?.translations?.[0];
    if (typeof translation?.text !== 'string' || !translation.text.trim()) {
      throw createTranslationError(
        'The translation service returned an invalid response. Please try again.',
        502,
        'TRANSLATE_INVALID_RESPONSE',
      );
    }

    return {
      originalText: text,
      text,
      targetLanguage: String(targetLanguage).trim().toLowerCase(),
      sourceLanguage: sourceCode || translation.detected_source_language || 'auto',
      translatedText: translation.text,
    };
  } catch (error) {
    if (error.code?.startsWith('TRANSLATE_')) throw error;

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throw createTranslationError(
        'Translation timed out. Please try again.',
        504,
        'TRANSLATE_TIMEOUT',
      );
    }

    const status = error.response?.status;
    if (status === 429) {
      throw createTranslationError(
        'The translation service is receiving too many requests. Please try again shortly.',
        429,
        'TRANSLATE_RATE_LIMITED',
      );
    }
    if (status === 456) {
      throw createTranslationError(
        'The translation account has reached its usage limit. Check your DeepL plan and try again later.',
        503,
        'TRANSLATE_QUOTA_EXCEEDED',
      );
    }
    if (status === 400) {
      throw createTranslationError(
        'The selected language pair or text is not supported by the translation provider.',
        400,
        'TRANSLATE_PROVIDER_INPUT_INVALID',
      );
    }
    if (status === 401 || status === 403) {
      throw createTranslationError(
        'The translation provider rejected its credentials. Check TRANSLATION_API_KEY.',
        502,
        'TRANSLATE_AUTH_FAILED',
      );
    }
    throw createTranslationError(
      'Translation is temporarily unavailable. Please try again.',
      502,
      'TRANSLATE_UNAVAILABLE',
    );
  }
};

module.exports = { translate, LANGUAGE_CODES };
