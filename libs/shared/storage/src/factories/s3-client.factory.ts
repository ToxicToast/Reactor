import { S3Client } from '@aws-sdk/client-s3';
import type { S3StorageConfig } from '../interfaces/index.js';

export const createS3Client = (config: S3StorageConfig): S3Client => {
  return new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
};
