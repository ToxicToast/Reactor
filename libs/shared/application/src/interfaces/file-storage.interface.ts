import type { Nullable } from '@toxictoast/shared-types';
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
  /** kopiert innerhalb des Buckets; Content-Type bleibt erhalten */
  copy(fromKey: string, toKey: string): Promise<void>;
  /** feste URL für Objekte in einem öffentlich lesbaren Prefix */
  publicUrl(key: string): string;
}
