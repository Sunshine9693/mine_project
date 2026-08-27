const axios = require('axios');

const getSearchResults = async (query) => {
  const normalizedQuery = String(query || '').trim().slice(0, 300);
  if (!normalizedQuery) throw Object.assign(new Error('Search query is required.'), { status: 400, code: 'SEARCH_QUERY_REQUIRED' });
  if (!process.env.SEARCH_API_URL?.trim()) throw Object.assign(new Error('Search service is not configured.'), { status: 503, code: 'SEARCH_NOT_CONFIGURED' });
  try {
    const response = await axios.get(process.env.SEARCH_API_URL, {
      params: { q: normalizedQuery, key: process.env.SEARCH_API_KEY }, timeout: 12000,
    });
    const items = response.data?.results || response.data?.organic_results || response.data?.web?.results || [];
    return items.slice(0, 8).map((item) => {
      const url = item.url || item.link;
      let safeUrl;
      try { safeUrl = new URL(url).protocol === 'https:' ? url : null; } catch { safeUrl = null; }
      return { title: String(item.title || '').slice(0, 200), description: String(item.description || item.snippet || '').slice(0, 500), source: String(item.source || (safeUrl ? new URL(safeUrl).hostname : '')).slice(0, 120), url: safeUrl };
    }).filter((item) => item.title && item.url);
  } catch (error) {
    if (error.code === 'SEARCH_QUERY_REQUIRED' || error.code === 'SEARCH_NOT_CONFIGURED') throw error;
    throw Object.assign(new Error('Web search is temporarily unavailable. Please try again.'), { status: error.response?.status === 429 ? 429 : 502, code: 'SEARCH_UNAVAILABLE' });
  }
};

module.exports = { getSearchResults };