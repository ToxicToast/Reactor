import { optionalEnv, requiredEnv } from '@toxictoast/shared-system';
import type { S3StorageConfig } from '../interfaces/index.js';

export const s3ConfigFromEnv = (
  endpointVariable: string,
  source: NodeJS.ProcessEnv = process.env,
): S3StorageConfig => {
  return {
    endpoint: requiredEnv(endpointVariable, source),
    region: optionalEnv('S3_REGION', 'us-east-1', source) ?? 'us-east-1',
    accessKeyId: requiredEnv('S3_ACCESS_KEY', source),
    secretAccessKey: requiredEnv('S3_SECRET_KEY', source),
  };
};
