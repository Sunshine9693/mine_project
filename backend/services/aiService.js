const axios = require('axios');

const AI_API_KEY = process.env.AI_API_KEY;
const DEFAULT_MODEL = 'gpt-4o-mini';

const buildSystemPrompt = (userPrefs = {}) => {
  const preferenceSummary = [
    userPrefs?.assistantName ? `The assistant is named ${userPrefs.assistantName}.` : 'The assistant is named Sunshine.',
    userPrefs?.voice ? `Preferred voice: ${userPrefs.voice}.` : 'Preferred voice: female voice.',
    userPrefs?.tone ? `Tone: ${userPrefs.tone}.` : 'Tone: friendly, intelligent, helpful, natural, and concise when appropriate.',
  ].join(' ');

  return `You are Sunshine, a friendly, intelligent, helpful, natural AI assistant.${preferenceSummary} Keep responses concise but useful. Never claim an action happened unless the backend actually performed it. If the request is not possible with the available tools, say so clearly and suggest the next best option.`;
};

const callAI = async ({ message, conversationId, userPreferences = {} }) => {
  if (!AI_API_KEY) {
    return {
      response: 'AI is not configured in this environment yet. Please set AI_API_KEY in the backend .env file.',
      conversationId: conversationId || null,
      action: null,
      fallback: true,
    };
  }

  const providerUrl = process.env.AI_PROVIDER_URL || 'https://api.openai.com/v1/chat/completions';

  try {
    const response = await axios.post(
      providerUrl,
      {
        model: process.env.AI_MODEL || DEFAULT_MODEL,
        messages: [
          { role: 'system', content: buildSystemPrompt(userPreferences) },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${AI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const text = response?.data?.choices?.[0]?.message?.content?.trim();

    return {
      response: text || 'I am here and ready to help.',
      conversationId: conversationId || null,
      action: null,
      fallback: false,
    };
  } catch (error) {
    const details = error?.response?.data || error.message;
    console.error('[AURA AI Service Error]:', details);

    return {
      response: 'I hit an AI service issue. Please try again in a moment.',
      conversationId: conversationId || null,
      action: null,
      fallback: true,
      error: typeof details === 'string' ? details : JSON.stringify(details),
    };
  }
};

module.exports = { callAI, buildSystemPrompt };
