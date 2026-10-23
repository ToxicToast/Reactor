import { optionalEnv, requiredEnv } from '@toxictoast/shared-system';
import type { KeycloakConfig } from '../interfaces/index.js';

export const keycloakConfigFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): KeycloakConfig => {
  return {
    issuer: requiredEnv('KEYCLOAK_ISSUER', source).replace(/\/+$/, ''),
    audience:
      optionalEnv('KEYCLOAK_AUDIENCE', undefined, source) ?? 'azkaban-api',
  };
};
