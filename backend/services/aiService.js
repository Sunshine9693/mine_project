const axios = require('axios');

const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
const MAX_CONTEXT_MESSAGES = 12;
const MAX_MEMORIES = 8;
const MAX_PROVIDER_RETRIES = 2;
const RETRY_DELAYS_MS = [500, 1000];

const buildSystemPrompt = (user = {}, memories = []) => {
  const memoryContext = memories.length
    ? `Relevant memories about the user:\n${memories
        .map((memory) => `- ${memory.key}: ${memory.value}`)
        .join('\n')}`
    : 'No relevant memories were found for this request.';

  return `You are AURA, a friendly, intelligent, professional personal AI assistant developed by Sana as a personal AI assistant project.

Your identity:
- Your name is AURA.
- You are Sana's personal AI assistant.
- You use Google's Gemini model as your underlying AI engine/provider.
- Google provides the Gemini model that powers you, but Google did not create or develop AURA.
- Never claim that Google created, developed, or owns AURA.
- Never say that you are a Google AI assistant.
- If asked which model powers you, you may explain that you use Google's Gemini model.

When asked who you are:
Say that you are AURA, Sana's personal AI assistant.

When asked who created or developed you:
Say that AURA was developed by Sana as a personal AI assistant project.

Be conversational and concise when appropriate. Use relevant user memories naturally, but do not mention the memory system unless asked. Never claim an action was completed unless the backend actually completed it. Do not invent access to tools, reminders, accounts, or real-world information. If something cannot be done, explain that clearly and suggest the next best option.

User name: ${user.name || 'there'}.
${memoryContext}`;
};

const tokenize = (value) =>
  String(value || '')
    .toLowerCase()
    .match(/[a-z0-9]+/g) || [];

const selectRelevantMemories = (memories, message) => {
  const terms = new Set(
    tokenize(message).filter((term) => term.length > 2)
  );

  return memories
    .map((memory) => {
      const memoryTerms = tokenize(
        `${memory.key} ${memory.value} ${memory.category}`
      );

      const overlap = memoryTerms.filter((term) =>
        terms.has(term)
      ).length;

      const preferenceBoost =
        memory.key === 'response_style' ? 1 : 0;

      return {
        memory,
        score: overlap + preferenceBoost,
      };
    })
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.memory.updatedAt - a.memory.updatedAt
    )
    .slice(0, MAX_MEMORIES)
    .map(({ memory }) => memory);
};

const getProviderErrorDetails = (error) => {
  const status = error?.response?.status || error?.status || null;

  const data = error?.response?.data || {};

  const providerError =
    data?.error || data;

  const message = String(
    providerError?.message ||
      error?.message ||
      'Unknown Gemini provider error'
  );

  const code = String(
    providerError?.status ||
      providerError?.code ||
      ''
  ).toLowerCase();

  const normalized = `${code} ${message}`.toLowerCase();

  let category = 'AI_PROVIDER_ERROR';
  let retryable = false;

  if (
    status === 400 &&
    (normalized.includes('api key') ||
      normalized.includes('key'))
  ) {
    category = 'AI_AUTH_ERROR';
  } else if (
    status === 401 ||
    status === 403
  ) {
    category = 'AI_AUTH_ERROR';
  } else if (
    status === 404 ||
    normalized.includes('model not found')
  ) {
    category = 'AI_MODEL_ERROR';
  } else if (
    status === 429 ||
    normalized.includes('quota') ||
    normalized.includes('rate limit') ||
    normalized.includes('resource exhausted')
  ) {
    category = 'AI_RATE_LIMITED';
    retryable = true;
  } else if (
    status >= 500
  ) {
    category = 'AI_PROVIDER_ERROR';
    retryable = true;
  }

  return {
    status,
    type: 'gemini',
    code: code || 'unknown',
    message,
    category,
    retryable,
  };
};

const logProviderFailure = (details, attempt) => {
  console.error(
    '[AURA Gemini Provider Error]',
    JSON.stringify({
      status: details.status,
      type: details.type,
      code: details.code,
      message: details.message,
      category: details.category,
      retryable: details.retryable,
      attempt,
    })
  );
};

const wait = (delay) =>
  new Promise((resolve) => setTimeout(resolve, delay));

const generateAIResponse = async ({
  message,
  history = [],
  user = {},
  memories = [],
}) => {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error(
      'Gemini AI provider is not configured'
    );

    error.code = 'AI_NOT_CONFIGURED';

    throw error;
  }

  const model =
    process.env.GEMINI_MODEL || DEFAULT_MODEL;

  const providerUrl =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const relevantMemories =
    selectRelevantMemories(memories, message);

  const contents = [
    ...history
      .slice(-MAX_CONTEXT_MESSAGES)
      .map(({ role, content }) => ({
        role: role === 'assistant' ? 'model' : 'user',
        parts: [
          {
            text: String(content || ''),
          },
        ],
      })),

    {
      role: 'user',
      parts: [
        {
          text: message,
        },
      ],
    },
  ];

  const requestBody = {
    systemInstruction: {
      parts: [
        {
          text: buildSystemPrompt(
            user,
            relevantMemories
          ),
        },
      ],
    },

    contents,

    generationConfig: {
      temperature: 0.7,
    },
  };

  for (
    let attempt = 0;
    attempt <= MAX_PROVIDER_RETRIES;
    attempt += 1
  ) {
    try {
      const response = await axios.post(
        providerUrl,
        requestBody,
        {
          params: {
            key: process.env.GEMINI_API_KEY,
          },

          headers: {
            'Content-Type': 'application/json',
          },

          timeout: 30000,
        }
      );

      const content =
        response?.data?.candidates?.[0]?.content?.parts
          ?.map((part) => part.text || '')
          .join('')
          .trim();

      if (!content) {
        const error = new Error(
          'Gemini returned an invalid response'
        );

        error.code = 'AI_INVALID_RESPONSE';

        throw error;
      }

      return {
        message: content,
        memories: relevantMemories,
      };
    } catch (error) {
      if (
        error.code === 'AI_NOT_CONFIGURED' ||
        error.code === 'AI_INVALID_RESPONSE'
      ) {
        throw error;
      }

      const details =
        getProviderErrorDetails(error);

      logProviderFailure(
        details,
        attempt + 1
      );

      if (
        details.retryable &&
        attempt < MAX_PROVIDER_RETRIES
      ) {
        await wait(
          RETRY_DELAYS_MS[attempt]
        );

        continue;
      }

      const providerError = new Error(
        'AI provider request failed'
      );

      providerError.code =
        details.category;

      providerError.status =
        details.status;

      providerError.providerDetails =
        details;

      throw providerError;
    }
  }
};

module.exports = {
  MAX_CONTEXT_MESSAGES,
  getProviderErrorDetails,
  buildSystemPrompt,
  generateAIResponse,
  selectRelevantMemories,
};