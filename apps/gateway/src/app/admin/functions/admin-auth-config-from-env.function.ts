import {
  booleanEnv,
  numberEnv,
  optionalEnv,
  requiredEnv,
} from '@toxictoast/shared-system';
import { TIME_S } from '@toxictoast/shared-types';
import { ADMIN_AUTH_DEFAULTS } from '../constants/index.js';
import type { AdminAuthConfig } from '../interfaces/index.js';

export const adminAuthConfigFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): AdminAuthConfig => {
  const secret = Buffer.from(
    requiredEnv('ADMIN_SESSION_SECRET', source),
    'base64',
  );
  if (secret.length !== ADMIN_AUTH_DEFAULTS.SECRET_LENGTH) {
    throw new Error(
      `ADMIN_SESSION_SECRET must be ${ADMIN_AUTH_DEFAULTS.SECRET_LENGTH} bytes, base64 encoded`,
    );
  }

  return {
    clientId:
      optionalEnv('ADMIN_CLIENT_ID', undefined, source) ??
      ADMIN_AUTH_DEFAULTS.CLIENT_ID,
    clientSecret: requiredEnv('ADMIN_CLIENT_SECRET', source),
    redirectUri: requiredEnv('ADMIN_REDIRECT_URI', source),
    sessionSecret: new Uint8Array(secret),
    sessionTtlSeconds:
      numberEnv(
        'ADMIN_SESSION_TTL_MINUTES',
        ADMIN_AUTH_DEFAULTS.SESSION_TTL_MINUTES,
        source,
      ) * TIME_S.MINUTE,
    secureCookies: booleanEnv('ADMIN_SECURE_COOKIES', false, source),
  };
};
