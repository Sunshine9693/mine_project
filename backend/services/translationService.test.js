const test = require('node:test');
const assert = require('node:assert/strict');
const axios = require('axios');
const { translate } = require('./translationService');

const withTranslationConfig = async (run) => {
  const originalPost = axios.post;
  const originalUrl = process.env.TRANSLATION_API_URL;
  const originalKey = process.env.TRANSLATION_API_KEY;
  process.env.TRANSLATION_API_URL = 'https://api-free.deepl.com/v2/translate';
  process.env.TRANSLATION_API_KEY = 'test-deepl-secret';

  try {
    await run();
  } finally {
    axios.post = originalPost;
    if (originalUrl === undefined) delete process.env.TRANSLATION_API_URL;
    else process.env.TRANSLATION_API_URL = originalUrl;
    if (originalKey === undefined) delete process.env.TRANSLATION_API_KEY;
    else process.env.TRANSLATION_API_KEY = originalKey;
  }
};

test('forwards the selected source and target languages and returns the provider translation', async () => {
  await withTranslationConfig(async () => {
    let request;
    axios.post = async (...args) => {
      request = args;
      return { data: { translations: [{ detected_source_language: 'EN', text: 'Bonjour !' }] } };
    };

    const result = await translate('Hello!', 'fr', 'en');
    assert.equal(request[0], 'https://api-free.deepl.com/v2/translate');
    assert.deepEqual(request[1], { text: ['Hello!'], target_lang: 'FR', source_lang: 'EN' });
    assert.deepEqual(request[2], {
      timeout: 15000,
      headers: {
        Authorization: 'DeepL-Auth-Key test-deepl-secret',
        'Content-Type': 'application/json',
      },
    });
    assert.deepEqual(result, {
      originalText: 'Hello!',
      text: 'Hello!',
      targetLanguage: 'fr',
      sourceLanguage: 'EN',
      translatedText: 'Bonjour !',
    });
  });
});

test('omits source_lang when automatic source detection is selected', async () => {
  await withTranslationConfig(async () => {
    let requestBody;
    axios.post = async (_url, body) => {
      requestBody = body;
      return { data: { translations: [{ detected_source_language: 'JA', text: 'こんにちは' }] } };
    };

    const result = await translate('こんにちは', 'en', 'auto');
    assert.deepEqual(requestBody, { text: ['こんにちは'], target_lang: 'EN' });
    assert.equal(result.sourceLanguage, 'JA');
    assert.equal(result.translatedText, 'こんにちは');
  });
});

test('preserves complete Unicode text and paragraph breaks without truncating', async () => {
  await withTranslationConfig(async () => {
    const originalText = 'नमस्ते, दुनिया! 🌏\n\n第二段落 — café.';
    let requestBody;
    axios.post = async (_url, body) => {
      requestBody = body;
      return { data: { translations: [{ text: 'Hello, world! 🌏\n\nSecond paragraph — café.' }] } };
    };

    const result = await translate(originalText, 'en', 'hi');
    assert.equal(requestBody.text[0], originalText);
    assert.equal(result.originalText, originalText);
    assert.equal(result.translatedText, 'Hello, world! 🌏\n\nSecond paragraph — café.');
  });
});

test('validates empty text and malformed language codes before requesting the provider', async () => {
  await withTranslationConfig(async () => {
    let called = false;
    axios.post = async () => {
      called = true;
      return { data: { translations: [{ text: 'unexpected' }] } };
    };

    await assert.rejects(translate('   ', 'fr'), {
      code: 'TRANSLATE_TEXT_REQUIRED',
      status: 400,
    });
    await assert.rejects(translate('hello', 'not-a-language'), {
      code: 'TRANSLATE_LANGUAGE_INVALID',
      status: 400,
    });
    await assert.rejects(translate('hello', 'xx'), {
      code: 'TRANSLATE_LANGUAGE_INVALID',
      status: 400,
    });
    await assert.rejects(translate('x'.repeat(110 * 1024), 'fr'), {
      code: 'TRANSLATE_TEXT_TOO_LONG',
      status: 413,
    });
    assert.equal(called, false);
  });
});

test('reports missing translation configuration without making a request', async () => {
  const originalUrl = process.env.TRANSLATION_API_URL;
  const originalKey = process.env.TRANSLATION_API_KEY;
  const originalPost = axios.post;
  delete process.env.TRANSLATION_API_URL;
  delete process.env.TRANSLATION_API_KEY;
  axios.post = async () => assert.fail('provider must not be called without configuration');

  try {
    await assert.rejects(translate('Hello', 'hi'), {
      code: 'TRANSLATE_NOT_CONFIGURED',
      status: 503,
    });
  } finally {
    axios.post = originalPost;
    if (originalUrl === undefined) delete process.env.TRANSLATION_API_URL;
    else process.env.TRANSLATION_API_URL = originalUrl;
    if (originalKey === undefined) delete process.env.TRANSLATION_API_KEY;
    else process.env.TRANSLATION_API_KEY = originalKey;
  }
});

test('normalizes quota, rate-limit, provider, malformed-response, and timeout errors', async () => {
  await withTranslationConfig(async () => {
    axios.post = async () => {
      const error = new Error('provider limit');
      error.response = { status: 456 };
      throw error;
    };
    await assert.rejects(translate('hello', 'hi'), {
      code: 'TRANSLATE_QUOTA_EXCEEDED',
      status: 503,
    });

    axios.post = async () => {
      const error = new Error('provider rate limit');
      error.response = { status: 429 };
      throw error;
    };
    await assert.rejects(translate('hello', 'hi'), {
      code: 'TRANSLATE_RATE_LIMITED',
      status: 429,
    });

    axios.post = async () => {
      const error = new Error('unsupported language pair');
      error.response = { status: 400 };
      throw error;
    };
    await assert.rejects(translate('hello', 'fr'), {
      code: 'TRANSLATE_PROVIDER_INPUT_INVALID',
      status: 400,
    });

    axios.post = async () => ({ data: { translations: [] } });
    await assert.rejects(translate('hello', 'hi'), {
      code: 'TRANSLATE_INVALID_RESPONSE',
      status: 502,
    });

    axios.post = async () => {
      const error = new Error('request timed out');
      error.code = 'ECONNABORTED';
      throw error;
    };
    await assert.rejects(translate('hello', 'hi'), {
      code: 'TRANSLATE_TIMEOUT',
      status: 504,
    });
  });
});
