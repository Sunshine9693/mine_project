const INTENT_KEYWORDS = {
  WEATHER: ['weather', 'temperature', 'rain', 'snow', 'humidity', 'forecast', 'sunny', 'cloudy'],
  SEARCH: ['search', 'look up', 'find', 'lookup', 'research', 'browse', 'what is', 'who is'],
  REMINDER: ['reminder', 'remind', 'alert', 'schedule', 'appointment', 'notify me', 'set a reminder'],
  NOTE: ['note', 'write down', 'remember', 'save note', 'journal', 'capture'],
  TASK: ['task', 'todo', 'to do', 'plan', 'schedule task', 'create task'],
  CALCULATOR: ['calculate', 'math', 'sum', 'total', 'multiply', 'divide', 'add', 'subtract', 'percentage'],
  TIME: ['time', 'clock', 'what time', 'timezone', 'date', 'today'],
  MEMORY: ['memory', 'remember', 'store', 'save memory', 'my preference', 'my note'],
  SETTINGS: ['settings', 'preference', 'theme', 'voice', 'sound', 'profile', 'change settings'],
};

const detectIntent = (message = '') => {
  const text = String(message || '').toLowerCase().trim();

  if (!text) {
    return 'CHAT';
  }

  const scores = Object.entries(INTENT_KEYWORDS).map(([intent, keywords]) => {
    const matches = keywords.filter((keyword) => text.includes(keyword)).length;
    return { intent, matches };
  });

  const best = scores.sort((a, b) => b.matches - a.matches)[0];

  if (best && best.matches > 0) {
    return best.intent;
  }

  return 'CHAT';
};

module.exports = { detectIntent };
