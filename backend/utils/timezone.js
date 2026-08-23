const DEFAULT_TIMEZONE = process.env.APP_TIMEZONE || process.env.TZ || 'Asia/Kolkata';

const toDateParts = (date, timeZone) => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(date);
  const map = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      map[part.type] = part.value;
    }
  }

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
  };
};

const addDays = (date, days, timeZone) => {
  const { year, month, day } = toDateParts(date, timeZone);
  const localDate = new Date(Date.UTC(year, month - 1, day));
  localDate.setUTCDate(localDate.getUTCDate() + days);
  return localDate.toISOString().slice(0, 10);
};

const resolveReminderDate = (input = 'today', timezone = DEFAULT_TIMEZONE) => {
  const value = String(input || '').trim().toLowerCase();
  const today = new Date();
  const offsets = {
    today: 0,
    tomorrow: 1,
    tonight: 0,
    'this evening': 0,
    'next monday': 1,
    'next tuesday': 1,
    'next wednesday': 1,
    'next thursday': 1,
    'next friday': 1,
    'next saturday': 1,
    'next sunday': 1,
  };

  if (!value || value === 'today' || value === 'tonight' || value === 'this evening') {
    return addDays(today, 0, timezone);
  }

  if (value === 'tomorrow') {
    return addDays(today, 1, timezone);
  }

  if (!Number.isNaN(Date.parse(value))) {
    return new Date(value).toISOString().slice(0, 10);
  }

  const known = Object.keys(offsets).find((key) => value.includes(key));
  if (known && known !== 'today' && known !== 'tomorrow' && known !== 'tonight' && known !== 'this evening') {
    const targetDay = known.replace('next ', '').toLowerCase();
    const dayMap = {
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      sunday: 0,
    };
    const currentDay = today.getDay();
    const nextNumber = dayMap[targetDay];
    const delta = (nextNumber - currentDay + 7) % 7 || 7;
    return addDays(today, delta, timezone);
  }

  return addDays(today, 0, timezone);
};

module.exports = {
  DEFAULT_TIMEZONE,
  resolveReminderDate,
};
