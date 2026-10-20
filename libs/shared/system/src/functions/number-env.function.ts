import type { Optional } from '@toxictoast/shared-kernel';
import { optionalEnv } from './optional-env.function.js';

export const numberEnv = (
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
  if (!Number.isInteger(parsed)) {
    throw new Error(`Environment variable ${name} must be an integer`);
  }
  return parsed;
};
