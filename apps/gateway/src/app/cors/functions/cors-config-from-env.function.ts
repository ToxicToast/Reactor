import { booleanEnv, listEnv, numberEnv } from '@toxictoast/shared-system';
import { CORS_DEFAULTS, CORS_ENV } from '../constants/index.js';
import type { CorsConfig } from '../interfaces/index.js';

const isOrigin = (value: string): boolean => {
  if (!URL.canParse(value)) {
    return false;
  }
  const url = new URL(value);
  return url.origin === value;
};

export const corsConfigFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): CorsConfig => {
  const origins = listEnv(CORS_ENV.ORIGINS, [...CORS_DEFAULTS.ORIGINS], source);
  const invalid = origins.filter((origin) => !isOrigin(origin));
  if (invalid.length > 0) {
    throw new Error(
      `${CORS_ENV.ORIGINS} must only contain origins like http://localhost:4200, got ${invalid.join(', ')}`,
    );
  }

  return {
    origins,
    allowCredentials: booleanEnv(
      CORS_ENV.ALLOW_CREDENTIALS,
      CORS_DEFAULTS.ALLOW_CREDENTIALS,
      source,
    ),
    maxAgeSeconds: numberEnv(
      CORS_ENV.MAX_AGE_SECONDS,
      CORS_DEFAULTS.MAX_AGE_SECONDS,
      source,
    ),
  };
};
