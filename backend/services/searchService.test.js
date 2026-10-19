const test = require('node:test');
const assert = require('node:assert/strict');
const axios = require('axios');
const { getSearchResults } = require('./searchService');
const informationController = require('../controllers/informationController');

test('calls SerpAPI with its documented parameters and normalizes organic results', async () => {
  const originalGet = axios.get;
  const originalKey = process.env.SEARCH_API_KEY;
  const originalUrl = process.env.SEARCH_API_URL;
  let request;
  process.env.SEARCH_API_KEY = 'test-serpapi-key';
  delete process.env.SEARCH_API_URL;
  axios.get = async (...args) => {
    request = args;
    return {
      data: {
        search_metadata: { status: 'Success' },
        organic_results: [
          { title: 'Python documentation', link: 'https://docs.python.org/3/', snippet: 'Official Python documentation' },
          { title: 'Insecure URL', link: 'http://example.com/page', snippet: 'Not included' },
        ],
      },
    };
  };

  try {
    const results = await getSearchResults('  Python official documentation  ');
    assert.equal(request[0], 'https://serpapi.com/search');
    assert.deepEqual(request[1].params, {
      engine: 'google',
      q: 'Python official documentation',
      api_key: 'test-serpapi-key',
    });
    assert.equal(request[1].timeout, 12000);
    assert.deepEqual(results, [{
      title: 'Python documentation',
      url: 'https://docs.python.org/3/',
      snippet: 'Official Python documentation',
      description: 'Official Python documentation',
      source: 'docs.python.org',
    }]);
  } finally {
    axios.get = originalGet;
    if (originalKey === undefined) delete process.env.SEARCH_API_KEY;
    else process.env.SEARCH_API_KEY = originalKey;
    if (originalUrl === undefined) delete process.env.SEARCH_API_URL;
    else process.env.SEARCH_API_URL = originalUrl;
  }
});

test('reports missing search configuration and provider failures explicitly', async () => {
  const originalGet = axios.get;
  const originalKey = process.env.SEARCH_API_KEY;
  process.env.SEARCH_API_KEY = '';
  await assert.rejects(getSearchResults('query'), { code: 'SEARCH_NOT_CONFIGURED', status: 503 });

  process.env.SEARCH_API_KEY = 'test-serpapi-key';
  axios.get = async () => {
    const error = new Error('rate limited');
    error.response = { status: 429 };
    throw error;
  };
  try {
    await assert.rejects(getSearchResults('query'), { code: 'SEARCH_RATE_LIMITED', status: 429 });
  } finally {
    axios.get = originalGet;
    if (originalKey === undefined) delete process.env.SEARCH_API_KEY;
    else process.env.SEARCH_API_KEY = originalKey;
  }
});

test('rejects a malformed SerpAPI response', async () => {
  const originalGet = axios.get;
  const originalKey = process.env.SEARCH_API_KEY;
  process.env.SEARCH_API_KEY = 'test-serpapi-key';
  axios.get = async () => ({ data: { organic_results: 'not-an-array' } });
  try {
    await assert.rejects(getSearchResults('query'), { code: 'SEARCH_INVALID_RESPONSE', status: 502 });
  } finally {
    axios.get = originalGet;
    if (originalKey === undefined) delete process.env.SEARCH_API_KEY;
    else process.env.SEARCH_API_KEY = originalKey;
  }
});

test('returns an empty result list for a successful empty response and rejects provider errors', async () => {
  const originalGet = axios.get;
  const originalKey = process.env.SEARCH_API_KEY;
  process.env.SEARCH_API_KEY = 'test-serpapi-key';
  try {
    axios.get = async () => ({
      data: { search_metadata: { status: 'Success' }, organic_results: [] },
    });
    assert.deepEqual(await getSearchResults('Python official documentation'), []);

    axios.get = async () => ({
      data: { error: 'SerpAPI request failed' },
    });
    await assert.rejects(getSearchResults('Python official documentation'), {
      code: 'SEARCH_UNAVAILABLE',
      status: 502,
    });
  } finally {
    axios.get = originalGet;
    if (originalKey === undefined) delete process.env.SEARCH_API_KEY;
    else process.env.SEARCH_API_KEY = originalKey;
  }
});

test('reproduces unrelated SerpAPI organic results and logs safe diagnostics', async () => {
  const originalGet = axios.get;
  const originalKey = process.env.SEARCH_API_KEY;
  const originalUrl = process.env.SEARCH_API_URL;
  const originalDiagnostics = process.env.AURA_SEARCH_DIAGNOSTICS;
  const originalInfo = console.info;
  const logs = [];
  let request;
  process.env.SEARCH_API_KEY = 'test-serpapi-secret';
  delete process.env.SEARCH_API_URL;
  process.env.AURA_SEARCH_DIAGNOSTICS = 'true';
  console.info = (...args) => logs.push(args.join(' '));
  axios.get = async (...args) => {
    request = args;
    return {
      status: 200,
      data: {
        search_parameters: { engine: 'google', q: 'Python official documentation' },
        search_metadata: { status: 'Success' },
        organic_results: [
          { title: 'Access the Official Journal - EUR-Lex - European Union', link: 'https://eur-lex.europa.eu/oj/direct-access.html', snippet: 'Official journal' },
          { title: 'Nassau County, NY - Official Website', link: 'https://www.nassaucountyny.gov/', snippet: 'Official website' },
        ],
      },
    };
  };
  const response = {
    json(payload) {
      return payload;
    },
  };
  let routeError;

  try {
    const payload = await informationController.search(
      { query: { q: 'Python official documentation' } },
      response,
      (error) => { routeError = error; },
    );

    assert.equal(routeError, undefined);
    assert.deepEqual(payload.results, []);
    assert.equal(request[0], 'https://serpapi.com/search');
    assert.deepEqual(request[1].params, {
      engine: 'google',
      q: 'Python official documentation',
      api_key: 'test-serpapi-secret',
    });
    const diagnostics = logs.join('\n');
    assert.match(diagnostics, /backend_query_received.*Python official documentation/);
    assert.match(diagnostics, /serpapi_request.*"engine":"google".*"query":"Python official documentation".*"apiKeyConfigured":true.*"apiKeyIncluded":true/);
    assert.match(diagnostics, /serpapi_response.*"providerQuery":"Python official documentation".*"httpStatus":200.*"organicResultsPresent":true/);
    assert.match(diagnostics, /"relevant":false/);
    assert.match(diagnostics, /EUR-Lex/);
    assert.match(diagnostics, /Nassau County/);
    assert.doesNotMatch(diagnostics, /test-serpapi-secret/);
  } finally {
    axios.get = originalGet;
    console.info = originalInfo;
    if (originalKey === undefined) delete process.env.SEARCH_API_KEY;
    else process.env.SEARCH_API_KEY = originalKey;
    if (originalUrl === undefined) delete process.env.SEARCH_API_URL;
    else process.env.SEARCH_API_URL = originalUrl;
    if (originalDiagnostics === undefined) delete process.env.AURA_SEARCH_DIAGNOSTICS;
    else process.env.AURA_SEARCH_DIAGNOSTICS = originalDiagnostics;
  }
});

test('maps search timeouts to a retryable service timeout', async () => {
  const originalGet = axios.get;
  const originalKey = process.env.SEARCH_API_KEY;
  process.env.SEARCH_API_KEY = 'test-serpapi-key';
  axios.get = async () => {
    const error = new Error('request timed out');
    error.code = 'ETIMEDOUT';
    throw error;
  };
  try {
    await assert.rejects(getSearchResults('query'), { code: 'SEARCH_TIMEOUT', status: 504 });
  } finally {
    axios.get = originalGet;
    if (originalKey === undefined) delete process.env.SEARCH_API_KEY;
    else process.env.SEARCH_API_KEY = originalKey;
  }
});
