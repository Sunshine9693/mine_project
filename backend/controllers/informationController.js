const { getWeather } = require('../services/weatherService');
const { getSearchResults } = require('../services/searchService');
const { getTime, getDate } = require('../services/informationService');
const { translate } = require('../services/translationService');
const { calculate } = require('../services/calculatorService');
const { convertCurrency } = require('../services/currencyService');
const { convertUnit } = require('../services/unitConverterService');

exports.calculate = (req, res, next) => {
  try {
    const expression = req.body.expression ?? req.body.query ?? '';
    const result = calculate(expression);
    return res.json({ success: true, result });
  } catch (error) {
    return next(error);
  }
};

exports.currency = (req, res, next) => {
  try {
    const outcome = convertCurrency(req.body.amount, req.body.from, req.body.to);
    return res.json({ success: true, ...outcome });
  } catch (error) {
    return next(error);
  }
};

exports.convert = (req, res, next) => {
  try {
    const value = convertUnit(req.body.value, req.body.from, req.body.to);
    return res.json({ success: true, value: req.body.value, from: req.body.from, to: req.body.to, result: value });
  } catch (error) {
    return next(error);
  }
};

exports.weather = async (req, res, next) => { try { return res.json({ success: true, weather: await getWeather(req.query.city) }); } catch (error) { return next(error); } };
exports.search = async (req, res, next) => { try { return res.json({ success: true, results: await getSearchResults(req.query.q) }); } catch (error) { return next(error); } };
exports.time = async (req, res, next) => { try { return res.json({ success: true, time: getTime(req.query.timezone) }); } catch (error) { return next(error); } };
exports.date = async (req, res, next) => { try { return res.json({ success: true, date: getDate(req.query.phrase) }); } catch (error) { return next(error); } };
exports.translation = async (req, res, next) => { try { const result = await translate(req.body.text, req.body.targetLanguage); return res.json({ success: true, originalText: result.originalText, translatedText: result.translatedText, targetLanguage: result.targetLanguage }); } catch (error) { return next(error); } };