import {
  booleanEnv,
  numberEnv,
  optionalEnv,
  requiredEnv,
} from '@toxictoast/shared-system';
import { NIM_DEFAULTS } from '../constants/index.js';
import type { NimConfig } from '../interfaces/index.js';

export const nimConfigFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): NimConfig => {
  const baseUrl =
    optionalEnv('NIM_BASE_URL', undefined, source) ?? NIM_DEFAULTS.BASE_URL;
  return {
    baseUrl: baseUrl.replace(NIM_DEFAULTS.TRAILING_SLASHES, ''),
    apiKey: optionalEnv('NIM_API_KEY', undefined, source) ?? null,
    model: requiredEnv('NIM_MODEL', source),
    timeoutMs: numberEnv('NIM_TIMEOUT_MS', NIM_DEFAULTS.TIMEOUT_MS, source),
    maxTokens: numberEnv('NIM_MAX_TOKENS', NIM_DEFAULTS.MAX_TOKENS, source),
    thinking: booleanEnv('NIM_ENABLE_THINKING', false, source),
  };
};
