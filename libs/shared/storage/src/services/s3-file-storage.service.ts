import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  NotFound,
  PutObjectCommand,
  S3ServiceException,
  type S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { FileStorage, StoredFile } from '@toxictoast/shared-application';
import type { Nullable } from '@toxictoast/shared-kernel';

export class S3FileStorage implements FileStorage {
  constructor(
    private readonly client: S3Client,
    private readonly signer: S3Client,
    private readonly bucket: string,
  ) {}

  createUploadUrl(
    key: string,
    mimeType: string,
    expiresInSeconds: number,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
    });
    return getSignedUrl(this.signer, command, {
      expiresIn: expiresInSeconds,
      signableHeaders: new Set(['content-type']),
    });
  }

  createDownloadUrl(key: string, expiresInSeconds: number): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.signer, command, { expiresIn: expiresInSeconds });
  }

  async stat(key: string): Promise<Nullable<StoredFile>> {
    try {
      const head = await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return {
        size: head.ContentLength ?? 0,
        mime_type: head.ContentType ?? 'application/octet-stream',
      };
    } catch (error) {
      if (this.isNotFound(error)) {
        return null;
      }
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  private isNotFound(error: unknown): boolean {
    if (error instanceof NotFound) {
      return true;
    }
    return (
      error instanceof S3ServiceException &&
      error.$metadata.httpStatusCode === 404
    );
  }
}
