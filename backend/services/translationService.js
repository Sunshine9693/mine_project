const axios = require('axios');

const LANGUAGE_CODES = { english: 'en', hindi: 'hi', french: 'fr', urdu: 'ur', spanish: 'es', german: 'de', tamil: 'ta', telugu: 'te', bengali: 'bn' };

const translate = async (text, targetLanguage) => {
  const sourceText = String(text || '').trim().slice(0, 2000);
  const target = String(targetLanguage || '').trim().toLowerCase();
  const targetCode = LANGUAGE_CODES[target] || (/^[a-z]{2}$/.test(target) ? target : null);
  if (!sourceText) throw Object.assign(new Error('Text to translate is required.'), { status: 400, code: 'TRANSLATE_TEXT_REQUIRED' });
  if (!targetCode) throw Object.assign(new Error('Please provide a supported target language.'), { status: 400, code: 'TRANSLATE_LANGUAGE_INVALID' });

  try {
    let translated;
    if (process.env.TRANSLATION_API_URL) {
      const response = await axios.post(process.env.TRANSLATION_API_URL, { q: sourceText, source: 'auto', target: targetCode, format: 'text', api_key: process.env.TRANSLATION_API_KEY }, { timeout: 12000 });
      translated = response.data?.translatedText;
    } else {
      const response = await axios.get('https://api.mymemory.translated.net/get', { params: { q: sourceText, langpair: `en|${targetCode}` }, timeout: 12000 });
      translated = response.data?.responseData?.translatedText;
    }
    if (!translated) throw new Error('Empty translation');
    return { text: sourceText, targetLanguage: target, translatedText: translated };
  } catch (error) {
    if (error.code === 'TRANSLATE_TEXT_REQUIRED' || error.code === 'TRANSLATE_LANGUAGE_INVALID') throw error;
    throw Object.assign(new Error('Translation is temporarily unavailable. Please try again.'), { status: 502, code: 'TRANSLATE_UNAVAILABLE' });
  }
};

module.exports = { translate, LANGUAGE_CODES };