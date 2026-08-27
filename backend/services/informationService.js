const { calculate } = require('./calculatorService');

const validTimezone = (timezone) => {
  try { new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(); return timezone; } catch { return null; }
};

const getTime = (timezone = process.env.APP_TIMEZONE || 'Asia/Kolkata') => {
  const safeTimezone = validTimezone(String(timezone).trim());
  if (!safeTimezone) throw Object.assign(new Error('Please provide a valid IANA timezone.'), { status: 400, code: 'INVALID_TIMEZONE' });
  const now = new Date();
  return { timezone: safeTimezone, iso: now.toISOString(), time: new Intl.DateTimeFormat('en-US', { timeZone: safeTimezone, hour: 'numeric', minute: '2-digit', second: '2-digit' }).format(now), date: new Intl.DateTimeFormat('en-US', { timeZone: safeTimezone, dateStyle: 'full' }).format(now) };
};

const getDate = (phrase = '') => {
  const now = new Date();
  const requested = String(phrase).toLowerCase();
  const match = requested.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);
  let date = now;
  if (match) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const delta = (days.indexOf(match[1]) - now.getDay() + 7) % 7 || 7;
    date = new Date(now); date.setDate(now.getDate() + delta);
  }
  return { iso: date.toISOString().slice(0, 10), date: new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(date) };
};

module.exports = { calculate, getTime, getDate, validTimezone };