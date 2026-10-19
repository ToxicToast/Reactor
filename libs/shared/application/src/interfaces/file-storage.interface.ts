import type { Nullable } from '@toxictoast/shared-kernel';
import type { StoredFile } from './stored-file.interface.js';

export interface FileStorage {
  createUploadUrl(
    key: string,
    mimeType: string,
    expiresInSeconds: number,
  ): Promise<string>;
  createDownloadUrl(key: string, expiresInSeconds: number): Promise<string>;
  stat(key: string): Promise<Nullable<StoredFile>>;
  delete(key: string): Promise<void>;
}
