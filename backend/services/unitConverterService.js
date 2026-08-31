const UNIT_FACTORS = {
  length: {
    meter: 1,
    metre: 1,
    kilometer: 1000,
    kilometre: 1000,
    centimeter: 0.01,
    centimetre: 0.01,
    millimeter: 0.001,
    millimetre: 0.001,
    mile: 1609.344,
    yard: 0.9144,
    foot: 0.3048,
    inch: 0.0254,
  },
  weight: {
    kilogram: 1,
    gram: 0.001,
    milligram: 0.000001,
    pound: 0.45359237,
    ounce: 0.028349523125,
  },
  temperature: {
    celsius: 'celsius',
    fahrenheit: 'fahrenheit',
    kelvin: 'kelvin',
  },
  volume: {
    liter: 1,
    litre: 1,
    milliliter: 0.001,
    millilitre: 0.001,
    gallon: 3.785411784,
  },
  time: {
    second: 1,
    minute: 60,
    hour: 3600,
    day: 86400,
  },
};

const normalizeUnit = (value = '') => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/s$/i, '')
  .replace(/\s+/g, '')
  .replace(/metre/g, 'meter')
  .replace(/kilometre/g, 'kilometer')
  .replace(/centimetre/g, 'centimeter')
  .replace(/millimetre/g, 'millimeter')
  .replace(/litre/g, 'liter');

const resolveCategory = (unit) => {
  for (const [category, units] of Object.entries(UNIT_FACTORS)) {
    if (Object.prototype.hasOwnProperty.call(units, unit)) return category;
  }
  return null;
};

const convertTemperature = (value, from, to) => {
  const fromUnit = normalizeUnit(from);
  const toUnit = normalizeUnit(to);

  let celsius;
  if (fromUnit === 'celsius') celsius = value;
  else if (fromUnit === 'fahrenheit') celsius = ((value - 32) * 5) / 9;
  else if (fromUnit === 'kelvin') celsius = value - 273.15;
  else throw Object.assign(new Error('Unsupported temperature unit.'), { status: 400, code: 'UNIT_INVALID' });

  if (toUnit === 'celsius') return celsius;
  if (toUnit === 'fahrenheit') return ((celsius * 9) / 5) + 32;
  if (toUnit === 'kelvin') return celsius + 273.15;

  throw Object.assign(new Error('Unsupported temperature unit.'), { status: 400, code: 'UNIT_INVALID' });
};

const convertUnit = (value, from, to) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    throw Object.assign(new Error('Please provide a valid numeric value for conversion.'), { status: 400, code: 'UNIT_VALUE_INVALID' });
  }

  const fromUnit = normalizeUnit(from);
  const toUnit = normalizeUnit(to);
  if (!fromUnit || !toUnit) {
    throw Object.assign(new Error('Please provide valid units for conversion.'), { status: 400, code: 'UNIT_INVALID' });
  }

  const sameCategory = resolveCategory(fromUnit) && resolveCategory(fromUnit) === resolveCategory(toUnit);
  if (!sameCategory) {
    throw Object.assign(new Error('These units belong to different categories and cannot be converted directly.'), { status: 400, code: 'UNIT_CATEGORY_INVALID' });
  }

  if (resolveCategory(fromUnit) === 'temperature') {
    return convertTemperature(numericValue, fromUnit, toUnit);
  }

  const category = resolveCategory(fromUnit);
  const fromFactor = UNIT_FACTORS[category][fromUnit];
  const toFactor = UNIT_FACTORS[category][toUnit];

  if (!fromFactor || !toFactor) {
    throw Object.assign(new Error('Unsupported unit conversion requested.'), { status: 400, code: 'UNIT_INVALID' });
  }

  return (numericValue * fromFactor) / toFactor;
};

module.exports = { convertUnit, normalizeUnit, UNIT_FACTORS };
