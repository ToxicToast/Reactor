import type { Optional } from '@toxictoast/shared-types';
import { optionalEnv } from './optional-env.function.js';

export const decimalEnv = (
  name: string,
  fallback?: Optional<number>,
  source: NodeJS.ProcessEnv = process.env,
): number => {
  const value = optionalEnv(name, undefined, source);
  if (value === undefined) {
    if (fallback === undefined) {
      throw new Error(`Missing environment variable ${name}`);
    }
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Environment variable ${name} must be a number`);
  }
  return parsed;
};
