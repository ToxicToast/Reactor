import { moderationThresholdsFromEnv } from './moderation-thresholds-from-env.function.js';
import { nimConfigFromEnv } from './nim-config-from-env.function.js';

describe('nimConfigFromEnv', () => {
  it('uses the hosted api by default', () => {
    expect(nimConfigFromEnv({ NIM_MODEL: 'nvidia/nemotron' })).toEqual({
      baseUrl: 'https://integrate.api.nvidia.com/v1',
      apiKey: null,
      model: 'nvidia/nemotron',
      timeoutMs: 15000,
      maxTokens: 1024,
      thinking: false,
    });
  });

  it('strips a trailing slash from a custom base url', () => {
    const config = nimConfigFromEnv({
      NIM_MODEL: 'm',
      NIM_BASE_URL: 'http://localhost:8000/v1/',
      NIM_API_KEY: 'key',
    });

    expect(config.baseUrl).toBe('http://localhost:8000/v1');
    expect(config.apiKey).toBe('key');
  });

  it('requires a model', () => {
    expect(() => nimConfigFromEnv({})).toThrow('NIM_MODEL');
  });
});

describe('moderationThresholdsFromEnv', () => {
  it('uses separate defaults', () => {
    expect(moderationThresholdsFromEnv({})).toEqual({
      approve: 0.95,
      spam: 0.85,
      hate: 0.85,
    });
  });

  it.each(['0', '1.2', '-0.5'])('rejects %s', (value) => {
    expect(() =>
      moderationThresholdsFromEnv({ MODERATION_SPAM_THRESHOLD: value }),
    ).toThrow('MODERATION_SPAM_THRESHOLD');
  });
});
