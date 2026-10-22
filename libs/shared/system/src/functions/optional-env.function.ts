import type { Optional } from '@toxictoast/shared-types';

export const optionalEnv = (
  name: string,
  fallback?: Optional<string>,
  source: NodeJS.ProcessEnv = process.env,
): Optional<string> => {
  const value = source[name];
  if (value === undefined || value === '') {
    return fallback;
  }
  return value;
};
