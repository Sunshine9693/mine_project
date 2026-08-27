const { getWeather } = require('../services/weatherService');
const { getSearchResults } = require('../services/searchService');
const { getTime, getDate } = require('../services/informationService');
const { translate } = require('../services/translationService');

exports.weather = async (req, res, next) => { try { return res.json({ success: true, weather: await getWeather(req.query.city) }); } catch (error) { return next(error); } };
exports.search = async (req, res, next) => { try { return res.json({ success: true, results: await getSearchResults(req.query.q) }); } catch (error) { return next(error); } };
exports.time = async (req, res, next) => { try { return res.json({ success: true, time: getTime(req.query.timezone) }); } catch (error) { return next(error); } };
exports.date = async (req, res, next) => { try { return res.json({ success: true, date: getDate(req.query.phrase) }); } catch (error) { return next(error); } };
exports.translation = async (req, res, next) => { try { return res.json({ success: true, translation: await translate(req.body.text, req.body.targetLanguage) }); } catch (error) { return next(error); } };