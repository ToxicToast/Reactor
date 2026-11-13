import { SECRET_CIPHER } from '../constants/index.js';
import type { SecretKeyring } from '../interfaces/index.js';
import { listEnv } from './list-env.function.js';
import { requiredEnv } from './required-env.function.js';

/**
 * Liest `${prefix}_KEYS` (z. B. "k1:<base64>,k2:<base64>") und
 * `${prefix}_KEY_ID` (Schlüssel für neue Werte).
 */
export const secretKeyringEnv = (
  prefix: string,
  source: NodeJS.ProcessEnv = process.env,
): SecretKeyring => {
  const keysEnv = `${prefix}_KEYS`;
  const entries = listEnv(keysEnv, [], source);
  if (entries.length === 0) {
    throw new Error(`${keysEnv} must list at least one key as id:base64`);
  }

  const keys = new Map<string, Buffer>();
  for (const entry of entries) {
    const separator = entry.indexOf(SECRET_CIPHER.KEY_SEPARATOR);
    if (separator <= 0) {
      throw new Error(`${keysEnv} entries must look like id:base64`);
    }
    const id = entry.slice(0, separator);
    if (keys.has(id)) {
      throw new Error(`${keysEnv} lists key ${id} twice`);
    }
    keys.set(id, Buffer.from(entry.slice(separator + 1), 'base64'));
  }

  return {
    currentKeyId: requiredEnv(`${prefix}_KEY_ID`, source),
    keys,
  };
};
