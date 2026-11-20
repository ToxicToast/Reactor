import {
  booleanEnv,
  numberEnv,
  optionalEnv,
  requiredEnv,
} from '@toxictoast/shared-system';
import { TIME_S } from '@toxictoast/shared-types';
import { ADMIN_AUTH_DEFAULTS, ADMIN_ENV } from '../constants/index.js';
import type { AdminAuthConfig } from '../interfaces/index.js';

export const adminAuthConfigFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): AdminAuthConfig => {
  const secret = Buffer.from(
    requiredEnv(ADMIN_ENV.SESSION_SECRET, source),
    'base64',
  );
  if (secret.length !== ADMIN_AUTH_DEFAULTS.SECRET_LENGTH) {
    throw new Error(
      `${ADMIN_ENV.SESSION_SECRET} must be ${ADMIN_AUTH_DEFAULTS.SECRET_LENGTH} bytes, base64 encoded`,
    );
  }

  return {
    clientId:
      optionalEnv(ADMIN_ENV.CLIENT_ID, undefined, source) ??
      ADMIN_AUTH_DEFAULTS.CLIENT_ID,
    clientSecret: requiredEnv(ADMIN_ENV.CLIENT_SECRET, source),
    redirectUri: requiredEnv(ADMIN_ENV.REDIRECT_URI, source),
    sessionSecret: new Uint8Array(secret),
    sessionTtlSeconds:
      numberEnv(
        ADMIN_ENV.SESSION_TTL_MINUTES,
        ADMIN_AUTH_DEFAULTS.SESSION_TTL_MINUTES,
        source,
      ) * TIME_S.MINUTE,
    secureCookies: booleanEnv(
      ADMIN_ENV.SECURE_COOKIES,
      ADMIN_AUTH_DEFAULTS.SECURE_COOKIES,
      source,
    ),
  };
};
