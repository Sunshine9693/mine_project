const test = require('node:test');
const assert = require('node:assert/strict');
const { detectIntent } = require('./intentService');
const { selectRelevantMemories } = require('./aiService');

test('detects supported memory intents', () => {
  assert.equal(detectIntent('Remember that I prefer concise answers.'), 'CREATE_MEMORY');
  assert.equal(detectIntent('Forget that I prefer concise answers.'), 'DELETE_MEMORY');
  assert.equal(detectIntent('What do you remember about me?'), 'GET_MEMORY');
  assert.equal(detectIntent('Explain binary search.'), 'CHAT');
});

test('selects relevant memories and excludes unrelated personal data', () => {
  const memories = [
    { key: 'response_style', value: 'concise', category: 'preference', updatedAt: new Date('2026-01-02') },
    { key: 'favorite_language', value: 'Python', category: 'preference', updatedAt: new Date('2026-01-01') },
    { key: 'current_project', value: 'AI assistant', category: 'project', updatedAt: new Date('2025-01-01') },
  ];

  const selected = selectRelevantMemories(memories, 'Explain binary search concisely.');
  assert.deepEqual(selected.map((memory) => memory.key), ['response_style']);
});
