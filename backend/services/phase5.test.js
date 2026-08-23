const test = require('node:test');
const assert = require('node:assert/strict');
const { detectIntent, parseReminderInput, parseTaskInput, parseNoteInput } = require('./intentService');

test('detects productivity intents from natural language', () => {
  assert.equal(detectIntent('Create a note called Machine Learning.'), 'CREATE_NOTE');
  assert.equal(detectIntent('Show my notes about Python.'), 'SEARCH_NOTES');
  assert.equal(detectIntent('Delete my Machine Learning note.'), 'DELETE_NOTE');
  assert.equal(detectIntent('Add a task to solve two LeetCode problems.'), 'CREATE_TASK');
  assert.equal(detectIntent('Mark my DSA task as completed.'), 'COMPLETE_TASK');
  assert.equal(detectIntent('Remind me to study DSA at 8 PM.'), 'CREATE_REMINDER');
  assert.equal(detectIntent('Show my reminders for today.'), 'GET_REMINDERS');
});

test('parses reminder details from natural language', () => {
  const reminder = parseReminderInput('Remind me tomorrow at 10 AM to revise DBMS.');
  assert.equal(reminder.title, 'revise DBMS');
  assert.equal(reminder.date, 'tomorrow');
  assert.equal(reminder.time, '10:00 AM');
  assert.equal(reminder.priority, 'MEDIUM');
});

test('parses task details from natural language', () => {
  const task = parseTaskInput('Create a high-priority task to complete my ML project.');
  assert.equal(task.title, 'complete my ML project');
  assert.equal(task.priority, 'HIGH');
  assert.equal(task.category, 'General');
});

test('parses note details from natural language', () => {
  const note = parseNoteInput('Take a note: supervised learning uses labeled data.');
  assert.equal(note.title, 'supervised learning');
  assert.equal(note.content, 'supervised learning uses labeled data.');
  assert.deepEqual(note.tags, ['ai', 'learning']);
});
