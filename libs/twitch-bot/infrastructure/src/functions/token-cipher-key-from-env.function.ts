import { requiredEnv } from '@toxictoast/shared-system';

export const tokenCipherKeyFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): Buffer => {
  const key = Buffer.from(requiredEnv('TWITCH_TOKEN_KEY', source), 'base64');
  if (key.length !== 32) {
    throw new Error('TWITCH_TOKEN_KEY must be 32 bytes encoded as base64');
  }
  return key;
};
