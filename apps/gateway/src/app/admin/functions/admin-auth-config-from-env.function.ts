import {
  booleanEnv,
  numberEnv,
  optionalEnv,
  requiredEnv,
} from '@toxictoast/shared-system';
import type { AdminAuthConfig } from '../interfaces/index.js';

const SECRET_LENGTH = 32;

export const adminAuthConfigFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): AdminAuthConfig => {
  const secret = Buffer.from(
    requiredEnv('ADMIN_SESSION_SECRET', source),
    'base64',
  );
  if (secret.length !== SECRET_LENGTH) {
    throw new Error(
      `ADMIN_SESSION_SECRET must be ${SECRET_LENGTH} bytes, base64 encoded`,
    );
  }

  return {
    clientId:
      optionalEnv('ADMIN_CLIENT_ID', undefined, source) ?? 'azkaban-gateway',
    clientSecret: requiredEnv('ADMIN_CLIENT_SECRET', source),
    redirectUri: requiredEnv('ADMIN_REDIRECT_URI', source),
    sessionSecret: new Uint8Array(secret),
    sessionTtlSeconds: numberEnv('ADMIN_SESSION_TTL_MINUTES', 60, source) * 60,
    secureCookies: booleanEnv('ADMIN_SECURE_COOKIES', false, source),
  };
};
