const axios = require('axios');

const SERPAPI_SEARCH_URL = 'https://serpapi.com/search';

const searchError = (message, status, code) =>
  Object.assign(new Error(message), { status, code });

const logSearchDiagnostic = (event, details) => {
  if (process.env.AURA_SEARCH_DIAGNOSTICS === 'true') {
    console.info('[AURA Search Diagnostic]', JSON.stringify({ event, ...details }));
  }
};

const queryTerms = (query) => [...new Set(query.toLowerCase().match(/[a-z0-9]+/g) || [])];

const matchedTerms = (text, terms) => {
  const textTerms = new Set(String(text || '').toLowerCase().match(/[a-z0-9]+/g) || []);
  return terms.filter((term) => textTerms.has(term));
};

const getSearchResults = async (query) => {
  const normalizedQuery = String(query || '').trim().slice(0, 300);
  const apiKey = process.env.SEARCH_API_KEY?.trim();
  if (!normalizedQuery) {
    throw searchError('Search query is required.', 400, 'SEARCH_QUERY_REQUIRED');
  }
  if (!apiKey) {
    throw searchError('Search service is not configured.', 503, 'SEARCH_NOT_CONFIGURED');
  }

  const url = process.env.SEARCH_API_URL?.trim() || SERPAPI_SEARCH_URL;
  logSearchDiagnostic('serpapi_request', {
    provider: 'SerpAPI',
    engine: 'google',
    query: normalizedQuery,
    apiKeyConfigured: true,
    apiKeyIncluded: true,
  });

  let response;
  try {
    response = await axios.get(url, {
      params: {
        engine: 'google',
        q: normalizedQuery,
        api_key: apiKey,
      },
      timeout: 12000,
    });
  } catch (error) {
    logSearchDiagnostic('serpapi_request_failed', {
      query: normalizedQuery,
      httpStatus: error.response?.status || null,
      errorCode: error.code || null,
    });
    if (error.response?.status === 429) {
      throw searchError('Web search is rate limited. Please try again shortly.', 429, 'SEARCH_RATE_LIMITED');
    }
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throw searchError('Web search timed out. Please try again.', 504, 'SEARCH_TIMEOUT');
    }
    throw searchError('Web search is temporarily unavailable. Please try again.', 502, 'SEARCH_UNAVAILABLE');
  }

  const data = response.data;
  const organicResultsPresent = Array.isArray(data?.organic_results);
  const providerQuery = data?.search_parameters?.q;
  const terms = queryTerms(normalizedQuery);
  const organicResults = organicResultsPresent ? data.organic_results : [];
  const relevanceThreshold = Math.max(1, Math.ceil(terms.length / 2));
  const relevance = organicResults.map((item) => {
    const title = String(item?.title || '');
    const titleMatches = matchedTerms(title, terms);
    const contentMatches = matchedTerms(`${title} ${item?.snippet || ''}`, terms);
    return {
      item,
      title,
      titleMatches,
      contentMatches,
      relevant: contentMatches.length >= relevanceThreshold,
    };
  });

  logSearchDiagnostic('serpapi_response', {
    query: normalizedQuery,
    providerQuery: typeof providerQuery === 'string' ? providerQuery : null,
    httpStatus: response.status,
    organicResultsPresent,
    resultCount: organicResults.length,
    relevanceThreshold,
    titles: relevance.slice(0, 8).map(({ title, titleMatches, contentMatches, relevant }) => ({
      title: title.slice(0, 200),
      titleMatches,
      contentMatches,
      relevant,
    })),
  });

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw searchError('The search provider returned invalid data.', 502, 'SEARCH_INVALID_RESPONSE');
  }
  if (data.error || (data.search_metadata?.status && data.search_metadata.status !== 'Success')) {
    throw searchError('The search provider could not complete the request.', 502, 'SEARCH_UNAVAILABLE');
  }
  if (!Array.isArray(data.organic_results)) {
    throw searchError('The search provider returned invalid results.', 502, 'SEARCH_INVALID_RESPONSE');
  }

  return relevance.filter(({ relevant }) => relevant).slice(0, 8).map(({ item }) => {
    const rawUrl = item?.link;
    let safeUrl;
    try {
      const parsedUrl = new URL(rawUrl);
      safeUrl = parsedUrl.protocol === 'https:' ? parsedUrl.href : null;
    } catch {
      safeUrl = null;
    }
    const title = String(item?.title || '').slice(0, 200);
    const snippet = String(item?.snippet || '').slice(0, 500);
    const source = String(item?.source || (safeUrl ? new URL(safeUrl).hostname : '')).slice(0, 120);
    return { title, url: safeUrl, snippet, description: snippet, source };
  }).filter((item) => item.title && item.url);
};

module.exports = { getSearchResults };
