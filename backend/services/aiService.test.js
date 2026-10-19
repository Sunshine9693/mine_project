const test = require('node:test');
const assert = require('node:assert/strict');
const axios = require('axios');
const { generateAIResponse, getProviderErrorDetails } = require('./aiService');

test('sends chat history to OpenRouter and normalizes its completion response', async () => {
  const originalPost = axios.post;
  const originalApiKey = process.env.OPENROUTER_API_KEY;
  const originalModel = process.env.OPENROUTER_MODEL;
  let request;
  process.env.OPENROUTER_API_KEY = 'test-openrouter-key';
  process.env.OPENROUTER_MODEL = 'openai/gpt-4o-mini';
  axios.post = async (...args) => {
    request = args;
    return { data: { choices: [{ message: { content: '  Hello from AURA.  ' } }] } };
  };

  try {
    const result = await generateAIResponse({
      message: 'Hello',
      history: [{ role: 'assistant', content: 'Earlier reply' }],
      user: { name: 'AURA user' },
      memories: [],
    });
    assert.equal(result.message, 'Hello from AURA.');
    assert.equal(request[0], 'https://openrouter.ai/api/v1/chat/completions');
    assert.equal(request[1].model, 'openai/gpt-4o-mini');
    assert.equal(request[1].stream, false);
    assert.equal(request[1].messages[0].role, 'system');
    assert.equal(request[1].messages[1].role, 'assistant');
    assert.equal(request[1].messages[2].content, 'Hello');
    assert.equal(request[2].headers.Authorization, 'Bearer test-openrouter-key');
    assert.equal(request[2].timeout, 30000);
  } finally {
    axios.post = originalPost;
    if (originalApiKey === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = originalApiKey;
    if (originalModel === undefined) delete process.env.OPENROUTER_MODEL;
    else process.env.OPENROUTER_MODEL = originalModel;
  }
});

test('normalizes OpenRouter auth, credits, rate-limit, model, and server errors', () => {
  assert.equal(getProviderErrorDetails({ response: { status: 401, data: { error: { message: 'unauthorized' } } } }).category, 'AI_AUTH_ERROR');
  assert.equal(getProviderErrorDetails({ response: { status: 402, data: { error: { message: 'insufficient credits' } } } }).category, 'AI_QUOTA_EXCEEDED');
  assert.equal(getProviderErrorDetails({ response: { status: 429, data: { error: { message: 'rate limit' } } } }).category, 'AI_RATE_LIMITED');
  assert.equal(getProviderErrorDetails({ response: { status: 404, data: { error: { message: 'model not found' } } } }).category, 'AI_MODEL_ERROR');
  assert.equal(getProviderErrorDetails({ response: { status: 400, data: { error: { message: 'invalid model' } } } }).category, 'AI_MODEL_ERROR');
  assert.equal(getProviderErrorDetails({ response: { status: 503, data: {} } }).retryable, true);
  assert.equal(getProviderErrorDetails({ code: 'ECONNABORTED' }).retryable, true);
});

test('rejects an empty OpenRouter completion as an invalid provider response', async () => {
  const originalPost = axios.post;
  const originalApiKey = process.env.OPENROUTER_API_KEY;
  const originalModel = process.env.OPENROUTER_MODEL;
  process.env.OPENROUTER_API_KEY = 'test-openrouter-key';
  process.env.OPENROUTER_MODEL = 'openai/gpt-4o-mini';
  axios.post = async () => ({ data: { choices: [] } });
  try {
    await assert.rejects(generateAIResponse({ message: 'Hello' }), { code: 'AI_INVALID_RESPONSE' });
  } finally {
    axios.post = originalPost;
    if (originalApiKey === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = originalApiKey;
    if (originalModel === undefined) delete process.env.OPENROUTER_MODEL;
    else process.env.OPENROUTER_MODEL = originalModel;
  }
});
