import { optionalEnv, requiredEnv } from '@toxictoast/shared-system';
import { KEYCLOAK_DEFAULTS, KEYCLOAK_ENV } from '../constants/index.js';
import type { KeycloakConfig } from '../interfaces/index.js';

export const keycloakConfigFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): KeycloakConfig => {
  return {
    issuer: requiredEnv(KEYCLOAK_ENV.ISSUER, source).replace(
      KEYCLOAK_DEFAULTS.TRAILING_SLASHES,
      '',
    ),
    audience:
      optionalEnv(KEYCLOAK_ENV.AUDIENCE, undefined, source) ??
      KEYCLOAK_DEFAULTS.AUDIENCE,
    agentClientPrefix:
      optionalEnv(KEYCLOAK_ENV.AGENT_CLIENT_PREFIX, undefined, source) ??
      KEYCLOAK_DEFAULTS.AGENT_CLIENT_PREFIX,
  };
};
