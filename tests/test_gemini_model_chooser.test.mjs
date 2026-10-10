import test from 'node:test';
import assert from 'node:assert/strict';
import {
  chooseBestFlashModel,
  parseModelVersion,
  resolveFlashModel,
  clearCachedGeminiModel,
  getCachedGeminiModel,
  extractTopicsWithGemini
} from '../src/lib/topicExtractor.js';

test('Gemini Model Chooser: parseModelVersion extracts semver-like components', () => {
  const v1 = parseModelVersion('models/gemini-1.5-flash');
  assert.equal(v1.major, 1);
  assert.equal(v1.minor, 5);
  assert.equal(v1.isExp, false);

  const v2 = parseModelVersion('gemini-2.0-flash-exp');
  assert.equal(v2.major, 2);
  assert.equal(v2.minor, 0);
  assert.equal(v2.isExp, true);

  const v3 = parseModelVersion('gemini-2.5-flash');
  assert.equal(v3.major, 2);
  assert.equal(v3.minor, 5);
  assert.equal(v3.isExp, false);
});

test('Gemini Model Chooser: chooseBestFlashModel selects the newest Flash model supporting generateContent', () => {
  const sampleModels = [
    {
      name: 'models/gemini-1.0-pro',
      supportedGenerationMethods: ['generateContent']
    },
    {
      name: 'models/gemini-1.5-pro',
      supportedGenerationMethods: ['generateContent']
    },
    {
      name: 'models/gemini-1.5-flash',
      supportedGenerationMethods: ['generateContent']
    },
    {
      name: 'models/gemini-2.0-flash-exp',
      supportedGenerationMethods: ['generateContent']
    },
    {
      name: 'models/gemini-2.0-flash',
      supportedGenerationMethods: ['generateContent']
    },
    {
      name: 'models/gemini-2.5-flash',
      supportedGenerationMethods: ['generateContent']
    },
    {
      name: 'models/gemini-3.0-flash-no-gen',
      supportedGenerationMethods: ['embedContent']
    }
  ];

  const chosen = chooseBestFlashModel(sampleModels);
  assert.equal(chosen, 'gemini-2.5-flash');
});

test('Gemini Model Chooser: ignores models without "flash" or without generateContent', () => {
  const sampleModels = [
    {
      name: 'models/gemini-2.5-pro',
      supportedGenerationMethods: ['generateContent']
    },
    {
      name: 'models/embedding-flash-001',
      supportedGenerationMethods: ['embedContent']
    },
    {
      name: 'models/gemini-1.5-flash',
      supportedGenerationMethods: ['generateContent']
    }
  ];

  const chosen = chooseBestFlashModel(sampleModels);
  assert.equal(chosen, 'gemini-1.5-flash');
});

test('Gemini Model Chooser: resolveFlashModel fetches models list and caches choice in memory', async () => {
  clearCachedGeminiModel();
  assert.equal(getCachedGeminiModel(), null);

  let fetchCallCount = 0;
  const mockFetch = async (url, options) => {
    fetchCallCount++;
    assert.equal(url, 'https://generativelanguage.googleapis.com/v1beta/models');
    assert.equal(options.headers['x-goog-api-key'], 'test-api-key-123');

    return {
      ok: true,
      status: 200,
      json: async () => ({
        models: [
          { name: 'models/gemini-1.5-flash', supportedGenerationMethods: ['generateContent'] },
          { name: 'models/gemini-2.0-flash', supportedGenerationMethods: ['generateContent'] }
        ]
      })
    };
  };

  // First resolution: calls fetch
  const model1 = await resolveFlashModel('test-api-key-123', mockFetch);
  assert.equal(model1, 'gemini-2.0-flash');
  assert.equal(fetchCallCount, 1);
  assert.equal(getCachedGeminiModel(), 'gemini-2.0-flash');

  // Second resolution: returns cached choice without additional fetch
  const model2 = await resolveFlashModel('test-api-key-123', mockFetch);
  assert.equal(model2, 'gemini-2.0-flash');
  assert.equal(fetchCallCount, 1); // Not called again

  // Cache clear helper works
  clearCachedGeminiModel();
  assert.equal(getCachedGeminiModel(), null);
});

test('Gemini Model Chooser: handles 400, 404, 429 with plain messages', async () => {
  clearCachedGeminiModel();

  // Test 400 Bad Request / Invalid Key
  const mockFetch400 = async () => ({
    ok: false,
    status: 400,
    text: async () => 'API key invalid'
  });

  await assert.rejects(
    async () => resolveFlashModel('bad-key', mockFetch400),
    (err) => {
      assert.match(err.message, /Invalid Gemini API key/i);
      assert.equal(err.status, 400);
      return true;
    }
  );

  // Test 404 Not Found
  const mockFetch404 = async () => ({
    ok: false,
    status: 404,
    text: async () => 'Not Found'
  });

  await assert.rejects(
    async () => resolveFlashModel('bad-url', mockFetch404),
    (err) => {
      assert.match(err.message, /models endpoint not found/i);
      assert.equal(err.status, 404);
      return true;
    }
  );

  // Test 429 Quota / Rate Limit
  const mockFetch429 = async () => ({
    ok: false,
    status: 429,
    text: async () => 'Rate limit exceeded'
  });

  await assert.rejects(
    async () => resolveFlashModel('rate-limited', mockFetch429),
    (err) => {
      assert.match(err.message, /quota exceeded or rate limit/i);
      assert.equal(err.status, 429);
      return true;
    }
  );
});

test('Gemini Model Chooser: extractTopicsWithGemini constructs dynamic model URL and returns parsed topics', async () => {
  clearCachedGeminiModel();

  const mockFetch = async (url, options) => {
    if (url === 'https://generativelanguage.googleapis.com/v1beta/models') {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          models: [
            { name: 'models/gemini-2.0-flash', supportedGenerationMethods: ['generateContent'] }
          ]
        })
      };
    }

    if (url.includes('models/gemini-2.0-flash:generateContent')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify([
                      {
                        title: 'Dynamic Gemini Topic',
                        description: 'A dynamically synthesized topic card from mock response.',
                        group_name: 'tech',
                        category: 'ai-ml',
                        tags: ['dynamic', 'test']
                      }
                    ])
                  }
                ]
              }
            }
          ]
        })
      };
    }

    throw new Error(`Unexpected URL: ${url}`);
  };

  const topics = await extractTopicsWithGemini('Some study text here', 'test-key', 'doc.md', { fetch: mockFetch });
  assert.equal(topics.length, 1);
  assert.equal(topics[0].title, 'Dynamic Gemini Topic');
  assert.equal(topics[0].description, 'A dynamically synthesized topic card from mock response.');
});

test('Gemini Model Chooser: follows nextPageToken across 2 pages and filters decoys, preferring stable non-lite', async () => {
  clearCachedGeminiModel();

  const requestedUrls = [];
  const mockFetch = async (url, options) => {
    requestedUrls.push(url);
    if (url === 'https://generativelanguage.googleapis.com/v1beta/models') {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          nextPageToken: 'token-page-2',
          models: [
            // Decoys to exclude:
            { name: 'models/gemini-2.5-flash-image', supportedGenerationMethods: ['generateContent'] },
            { name: 'models/gemini-2.0-flash-tts', supportedGenerationMethods: ['generateContent'] },
            { name: 'models/gemini-2.0-flash-audio', supportedGenerationMethods: ['generateContent'] },
            { name: 'models/gemini-2.0-flash-live', supportedGenerationMethods: ['generateContent'] },
            { name: 'models/text-embedding-004', supportedGenerationMethods: ['embedContent'] },
            { name: 'models/gemini-2.0-flash-native', supportedGenerationMethods: ['generateContent'] },
            { name: 'models/gemini-2.0-flash-robotics', supportedGenerationMethods: ['generateContent'] },
            { name: 'models/gemini-2.0-flash-computer-use', supportedGenerationMethods: ['generateContent'] },
            { name: 'models/gemini-2.0-flash-no-gen', supportedGenerationMethods: ['embedContent'] },
            // Preview / exp on page 1:
            { name: 'models/gemini-2.0-flash-exp', supportedGenerationMethods: ['generateContent'] },
            { name: 'models/gemini-2.0-flash-preview', supportedGenerationMethods: ['generateContent'] }
          ]
        })
      };
    }

    if (url === 'https://generativelanguage.googleapis.com/v1beta/models?pageToken=token-page-2') {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          nextPageToken: null,
          models: [
            // Stable models: non-lite and lite tie
            { name: 'models/gemini-2.0-flash-lite', supportedGenerationMethods: ['generateContent'] },
            { name: 'models/gemini-2.0-flash', supportedGenerationMethods: ['generateContent'] },
            { name: 'models/gemini-1.5-flash', supportedGenerationMethods: ['generateContent'] }
          ]
        })
      };
    }

    throw new Error(`Unexpected URL called: ${url}`);
  };

  const chosen = await resolveFlashModel('valid-key', mockFetch);
  assert.equal(requestedUrls.length, 2, 'Must request both page 1 and page 2 via nextPageToken');
  assert.equal(chosen, 'gemini-2.0-flash', 'Must exclude decoys, prefer stable over exp, and prefer non-lite over lite on ties');
});

test('Gemini Model Chooser: picks preview/exp only if no stable flash model exists', () => {
  const onlyExpModels = [
    { name: 'models/gemini-2.0-flash-image', supportedGenerationMethods: ['generateContent'] },
    { name: 'models/gemini-2.0-flash-exp', supportedGenerationMethods: ['generateContent'] },
    { name: 'models/gemini-1.5-flash-preview', supportedGenerationMethods: ['generateContent'] }
  ];

  const chosen = chooseBestFlashModel(onlyExpModels);
  assert.equal(chosen, 'gemini-2.0-flash-exp', 'Should fall back to newest exp/preview when no stable flash exists');
});
