import { corsConfigFromEnv } from './cors-config-from-env.function.js';

describe('corsConfigFromEnv', () => {
  it('keeps cors off without origins', () => {
    expect(corsConfigFromEnv({})).toEqual({
      origins: [],
      allowCredentials: false,
      maxAgeSeconds: 600,
    });
  });

  it('reads origins, credentials and max age', () => {
    expect(
      corsConfigFromEnv({
        CORS_ORIGINS: 'http://localhost:4200, https://toxictoast.de',
        CORS_ALLOW_CREDENTIALS: 'true',
        CORS_MAX_AGE_SECONDS: '60',
      }),
    ).toEqual({
      origins: ['http://localhost:4200', 'https://toxictoast.de'],
      allowCredentials: true,
      maxAgeSeconds: 60,
    });
  });

  it.each([
    ['*'],
    ['http://localhost:4200/'],
    ['https://toxictoast.de/app'],
    ['localhost:4200'],
  ])('refuses %p', (origin) => {
    expect(() => corsConfigFromEnv({ CORS_ORIGINS: origin })).toThrow(
      'CORS_ORIGINS must only contain origins',
    );
  });
});
