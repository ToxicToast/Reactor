import { isUuid } from '@toxictoast/shared-kernel';
import { requiredEnv } from './required-env.function.js';

export const uuidEnv = (
  name: string,
  source: NodeJS.ProcessEnv = process.env,
): string => {
  const value = requiredEnv(name, source);
  if (!isUuid(value)) {
    throw new Error(`Environment variable ${name} must be a uuid`);
  }
  return value.toLowerCase();
};
