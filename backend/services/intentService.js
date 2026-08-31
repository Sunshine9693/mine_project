const FUTURE_INTENTS = ['CREATE_TASK', 'CREATE_NOTE', 'CREATE_REMINDER', 'WEATHER', 'WEB_SEARCH', 'SEARCH', 'CALCULATE', 'TIME', 'TIME_DATE', 'DATE', 'TRANSLATE', 'UNIT_CONVERSION', 'CURRENCY_CONVERSION', 'LOCATION'];

const normalizeTitle = (value) => String(value || '').trim().replace(/\s+/g, ' ').replace(/[.!?]+$/, '');

const normalizeTime = (raw = '') => {
  const value = String(raw || '').trim();
  const match = value.toLowerCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);

  if (!match) {
    return '09:00 AM';
  }

  const hour = Number(match[1]);
  const minute = match[2] ? Number(match[2]) : 0;
  const suffix = match[3].toUpperCase();
  const normalizedHour = Math.min(12, Math.max(1, hour));

  return `${String(normalizedHour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${suffix}`;
};

const parseNoteInput = (message = '') => {
  const text = String(message || '').trim();
  const noteMatch = text.match(/(?:take\s+a\s+note|create\s+a\s+note|note(?:\s+called)?|add\s+note)(?:\s*[:\-])?\s*(.+)/i) ||
    text.match(/(?:take\s+note|create\s+note|add\s+note)\s*[:\-]?\s*(.+)/i) ||
    text.match(/(?:call\s+it\s+|called\s+)([A-Za-z0-9\s-]+?)(?:\.|$)/i);

  let title = '';
  let content = text;
  if (noteMatch) {
    content = noteMatch[1].trim();
    title = normalizeTitle(content.split(/\s+(?=uses?|about|for|with|and|to|from|on|in)/i)[0] || content).slice(0, 80) || 'Untitled note';
  }

  if (/^note\s+/i.test(text)) {
    title = normalizeTitle(text.replace(/^note\s+/i, ''));
    content = title;
  }

  if (/^(create|take|add)\s+.*?note.*?called\s+(.+)/i.test(text)) {
    title = normalizeTitle(text.match(/called\s+(.+)/i)[1].replace(/[.!?]+$/, ''));
    content = title;
  }

  if (!title) {
    title = normalizeTitle(content.replace(/^[^a-z0-9]+/i, '').split(/[.!?]/)[0] || 'Untitled note');
  }

  const sourceWords = String(content).toLowerCase().match(/[a-z0-9]+/g) || [];
  const filteredWords = [...new Set(sourceWords.filter((word) => word.length > 3 && !['with', 'from', 'their', 'there', 'about', 'using', 'labeled', 'learn'].includes(word)))];
  let tags = filteredWords.slice(0, 4);

  if (/\bai\b|\bmachine\b|\blearning\b/i.test(content)) {
    tags = ['ai', 'learning'];
  }

  return {
    title: title || 'Untitled note',
    content: content || '',
    tags: tags.length ? tags : ['general'],
  };
};

const parseTaskInput = (message = '') => {
  const text = String(message || '').trim();
  const priority = /high[- ]priority|urgent|important/i.test(text) ? 'HIGH' : /medium|normal/i.test(text) ? 'MEDIUM' : 'MEDIUM';
  const titleMatch = text.match(/(?:create|add|new)\s+(?:a\s+)?(?:high[- ]priority\s+)?(?:task(?:\s+(?:for|to))?\s+)?(.+)/i) ||
    text.match(/(?:task\s+(?:for|to)\s+)(.+)/i) ||
    text.match(/(?:solve|complete|finish)\s+(.+)/i);
  const title = normalizeTitle((titleMatch && titleMatch[1]) || text.replace(/^(create|add|new)\s+/i, '').replace(/\.$/, '')) || 'New task';
  const categoryMatch = text.match(/\b(?:category|for)\s+([a-z0-9\s-]+?)(?:\.|$)/i);

  return {
    title,
    description: text,
    priority,
    dueDate: null,
    category: categoryMatch ? normalizeTitle(categoryMatch[1]) : 'General',
  };
};

const parseReminderInput = (message = '') => {
  const text = String(message || '').trim();
  const priority = /high[- ]priority|urgent|important/i.test(text) ? 'HIGH' : /low/i.test(text) ? 'LOW' : 'MEDIUM';
  const dateMatch = text.match(/\b(tomorrow|today|tonight|this evening|next monday|next tuesday|next wednesday|next thursday|next friday|next saturday|next sunday)\b/i);
  const timeMatch = text.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i);

  let cleaned = text.replace(/^(?:remind\s+me|reminder(?:\s+for)?)/i, '').trim();
  if (dateMatch) {
    cleaned = cleaned.replace(new RegExp(dateMatch[0], 'i'), '').trim();
  }
  if (timeMatch) {
    cleaned = cleaned.replace(new RegExp(timeMatch[0], 'ig'), '').trim();
  }
  cleaned = cleaned.replace(/^(?:\s*(?:at|to|about|for)\s+)+/i, '').replace(/[.!?]+$/, '').trim();

  return {
    title: normalizeTitle(cleaned) || 'Reminder',
    date: dateMatch ? dateMatch[1].toLowerCase() : 'today',
    time: timeMatch ? normalizeTime(timeMatch[1]) : '09:00 AM',
    priority,
    enabled: true,
  };
};

const detectIntent = (message = '') => {
  const text = String(message).trim();
  const lower = text.toLowerCase();

  if (/\b(weather|temperature|forecast|rain)\b/i.test(lower) && !/my\s+weather/i.test(lower)) return 'WEATHER';
  if (/\b(?:search the web|latest .* news|what happened.*news|find information about|look up .*today|technology news)\b|^(?:search|find|look up)\b/i.test(lower)) return 'WEB_SEARCH';
  if (/^(calculate|compute)\b|\b(\d+(?:\.\d+)?\s*(?:\+|-|\*|\/|%|times|multiplied|divided|percent|power))\b/i.test(lower)) return 'CALCULATE';
  if (/\b(?:convert|how many|how much)\b.*\b(?:kilometer|kilometre|mile|meter|metre|centimeter|centimetre|gram|kilogram|fahrenheit|celsius|kelvin|liter|gallon|second|minute|hour|day|foot|inch|pound|ounce)\b/i.test(lower)) return 'UNIT_CONVERSION';
  if (/\b(?:what time is it|what time is it in|what is the time|time in|current time in|what is the date|what day is today|date in|today's date|what's the date)\b/i.test(lower)) return 'TIME_DATE';
  if (/\b(?:convert|exchange|worth)\b.*\b(?:usd|inr|eur|gbp|jpy|cad|aud|sgd|aed|pkr|dollar|rupee|euro|pound|yen)\b/i.test(lower)) return 'CURRENCY_CONVERSION';
  if (/\bwhere am i\b|\bcurrent location\b|\btimezone of\b|\bnear me\b|\bdistance between\b/i.test(lower)) return 'LOCATION';
  if (/\bwhat time is it\b|\btime\s+(?:is it|in|at)\b/i.test(lower)) return 'TIME_DATE';
  if (/\b(today'?s date|what date|what day is today|next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i.test(lower)) return 'DATE';
  if (/\b(?:translate|how do i say)\b/i.test(lower)) return 'TRANSLATE';

  if (/\bnotes?\b.*\b(search|show|list|get|find)\b|show my notes|what notes|notes about/i.test(lower)) {
    return 'SEARCH_NOTES';
  }
  if (/^(what do you remember|what can you remember|show me what you remember|list my memories)/i.test(text)) {
    return 'GET_MEMORY';
  }
  if (/^(forget|remove from memory|delete memory|forget that)/i.test(text)) {
    return 'DELETE_MEMORY';
  }
  if (/^(remember|store in memory|save to memory)/i.test(text)) {
    return 'CREATE_MEMORY';
  }
  if (/\b(?:take\s+a\s+note|create\s+a\s+note|new note|note\s+called|add\s+note)\b/i.test(text) || /\bnote\s*:/i.test(text)) {
    return 'CREATE_NOTE';
  }
  if (/\b(?:show|list|get|view)\s+my\s+notes\b|\bnotes\s+about\b|\bmy\s+notes\b.*\bpython\b/i.test(text)) {
    return 'GET_NOTES';
  }
  if (/\b(?:delete|remove)\s+my\s+.*\s+note\b|\bdelete\s+my\s+.*\s+notes?\b/i.test(text)) {
    return 'DELETE_NOTE';
  }
  if (/\bpin\s+my\s+.*\s+note\b|\bpin\s+.*\s+note\b/i.test(text)) {
    return 'PIN_NOTE';
  }
  if (/\b(?:update|edit)\s+my\s+.*\s+note\b|\bupdate\s+.*\s+note\b/i.test(text)) {
    return 'UPDATE_NOTE';
  }
  if (/\b(?:add|create|new)\s+(?:a\s+)?task\b|\btask\s+to\b|\bleetcode\b/i.test(text) || /\btask\s*:/i.test(text)) {
    return 'CREATE_TASK';
  }
  if (/\b(?:show|list|get|view)\s+my\s+tasks\b|\bpending\s+tasks\b|\bdue\s+today\b|\bhigh[- ]priority\s+tasks\b/i.test(text)) {
    return 'GET_TASKS';
  }
  if (/\b(?:mark|complete|finish)\s+my\s+.*\s+task\b|\bcomplete\s+.*\s+task\b/i.test(text)) {
    return 'COMPLETE_TASK';
  }
  if (/\b(?:delete|remove)\s+my\s+.*\s+task\b|\bdelete\s+my\s+.*\s+tasks?\b/i.test(text)) {
    return 'DELETE_TASK';
  }
  if (/\b(?:update|edit)\s+my\s+.*\s+task\b|\bupdate\s+.*\s+task\b/i.test(text)) {
    return 'UPDATE_TASK';
  }
  if (/\b(?:remind me|create a reminder|add reminder|new reminder)\b|\breminder\s*:/i.test(text)) {
    return 'CREATE_REMINDER';
  }
  if (/\b(?:show|list|get|view)\s+my\s+reminders?\b|\breminders?\s+for\s+today\b|\bupcoming\s+reminders?\b/i.test(text)) {
    return 'GET_REMINDERS';
  }
  if (/\b(?:cancel|delete|remove)\s+my\s+.*\s+reminder\b|\bdelete\s+my\s+.*\s+reminders?\b/i.test(text)) {
    return 'DELETE_REMINDER';
  }

  return 'CHAT';
};

module.exports = { detectIntent, FUTURE_INTENTS, parseNoteInput, parseTaskInput, parseReminderInput };
