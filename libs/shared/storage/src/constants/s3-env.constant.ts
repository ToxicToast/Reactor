export const S3_ENV = {
  ENDPOINT: 'S3_ENDPOINT',
  PUBLIC_ENDPOINT: 'S3_PUBLIC_ENDPOINT',
  REGION: 'S3_REGION',
  ACCESS_KEY: 'S3_ACCESS_KEY',
  SECRET_KEY: 'S3_SECRET_KEY',
  BUCKET: 'S3_BUCKET',
} as const;

export const S3_DEFAULTS = {
  REGION: 'us-east-1',
} as const;
