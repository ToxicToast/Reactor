import { SECRET_CIPHER } from '../constants/index.js';
import { requiredEnv } from './required-env.function.js';

export const secretKeyEnv = (
  name: string,
  source: NodeJS.ProcessEnv = process.env,
): Buffer => {
  const key = Buffer.from(requiredEnv(name, source), 'base64');
  if (key.length !== SECRET_CIPHER.KEY_BYTES) {
    throw new Error(
      `${name} must be ${SECRET_CIPHER.KEY_BYTES} bytes encoded as base64`,
    );
  }
  return key;
};
