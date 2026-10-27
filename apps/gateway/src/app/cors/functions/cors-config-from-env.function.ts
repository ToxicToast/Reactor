import { booleanEnv, listEnv, numberEnv } from '@toxictoast/shared-system';
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
  const origins = listEnv('CORS_ORIGINS', [], source);
  const invalid = origins.filter((origin) => !isOrigin(origin));
  if (invalid.length > 0) {
    throw new Error(
      `CORS_ORIGINS must only contain origins like http://localhost:4200, got ${invalid.join(', ')}`,
    );
  }

  return {
    origins,
    allowCredentials: booleanEnv('CORS_ALLOW_CREDENTIALS', false, source),
    maxAgeSeconds: numberEnv('CORS_MAX_AGE_SECONDS', 600, source),
  };
};
