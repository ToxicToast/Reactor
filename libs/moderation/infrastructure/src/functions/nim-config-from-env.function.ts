import {
  booleanEnv,
  numberEnv,
  optionalEnv,
  requiredEnv,
} from '@toxictoast/shared-system';
import type { NimConfig } from '../interfaces/index.js';

const DEFAULT_BASE_URL = 'https://integrate.api.nvidia.com/v1';

export const nimConfigFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): NimConfig => {
  const baseUrl =
    optionalEnv('NIM_BASE_URL', undefined, source) ?? DEFAULT_BASE_URL;
  return {
    baseUrl: baseUrl.replace(/\/+$/, ''),
    apiKey: optionalEnv('NIM_API_KEY', undefined, source) ?? null,
    model: requiredEnv('NIM_MODEL', source),
    timeoutMs: numberEnv('NIM_TIMEOUT_MS', 15000, source),
    maxTokens: numberEnv('NIM_MAX_TOKENS', 1024, source),
    thinking: booleanEnv('NIM_ENABLE_THINKING', false, source),
  };
};
