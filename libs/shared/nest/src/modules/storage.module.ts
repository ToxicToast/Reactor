import { Global, Module } from '@nestjs/common';
import type { FileStorage } from '@toxictoast/shared-application';
import {
  createS3Client,
  S3FileStorage,
  s3ConfigFromEnv,
} from '@toxictoast/shared-storage';
import { requiredEnv } from '@toxictoast/shared-system';
import { TOKENS } from '../constants/index.js';

@Global()
@Module({
  providers: [
    {
      provide: TOKENS.FILE_STORAGE,
      useFactory: (): FileStorage => {
        return new S3FileStorage(
          createS3Client(s3ConfigFromEnv('S3_ENDPOINT')),
          createS3Client(s3ConfigFromEnv('S3_PUBLIC_ENDPOINT')),
          requiredEnv('S3_BUCKET'),
        );
      },
    },
  ],
  exports: [TOKENS.FILE_STORAGE],
})
export class StorageModule {}
