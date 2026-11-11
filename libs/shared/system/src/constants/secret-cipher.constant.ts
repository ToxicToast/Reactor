export const SECRET_CIPHER = {
  ALGORITHM: 'aes-256-gcm',
  VERSION: 'v2',
  LEGACY_VERSION: 'v1',
  SEPARATOR: '.',
  KEY_SEPARATOR: ':',
  DEFAULT_KEY_ID: 'k1',
  IV_BYTES: 12,
  KEY_BYTES: 32,
} as const;
