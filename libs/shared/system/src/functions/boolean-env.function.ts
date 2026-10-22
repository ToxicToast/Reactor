import type { Optional } from '@toxictoast/shared-types';
import { optionalEnv } from './optional-env.function.js';

export const booleanEnv = (
  name: string,
  fallback?: Optional<boolean>,
  source: NodeJS.ProcessEnv = process.env,
): boolean => {
  const value = optionalEnv(name, undefined, source);
  if (value === undefined) {
    if (fallback === undefined) {
      throw new Error(`Missing environment variable ${name}`);
    }
    return fallback;
  }
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  throw new Error(`Environment variable ${name} must be true or false`);
};
