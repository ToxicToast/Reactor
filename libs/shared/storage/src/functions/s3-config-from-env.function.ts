import { optionalEnv, requiredEnv } from '@toxictoast/shared-system';
import { S3_DEFAULTS, S3_ENV } from '../constants/index.js';
import type { S3StorageConfig } from '../interfaces/index.js';

export const s3ConfigFromEnv = (
  endpointVariable: string,
  source: NodeJS.ProcessEnv = process.env,
): S3StorageConfig => {
  return {
    endpoint: requiredEnv(endpointVariable, source),
    region:
      optionalEnv(S3_ENV.REGION, S3_DEFAULTS.REGION, source) ??
      S3_DEFAULTS.REGION,
    accessKeyId: requiredEnv(S3_ENV.ACCESS_KEY, source),
    secretAccessKey: requiredEnv(S3_ENV.SECRET_KEY, source),
  };
};
