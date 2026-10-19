import type { Nullable } from '@toxictoast/shared-kernel';
import type { FileStorage, StoredFile } from '../interfaces/index.js';

export class InMemoryFileStorage implements FileStorage {
  readonly files = new Map<string, StoredFile>();
  readonly deleted: Array<string> = [];

  async createUploadUrl(key: string): Promise<string> {
    return `https://storage.test/upload/${key}`;
  }

  async createDownloadUrl(key: string): Promise<string> {
    return `https://storage.test/download/${key}`;
  }

  async stat(key: string): Promise<Nullable<StoredFile>> {
    return this.files.get(key) ?? null;
  }

  async delete(key: string): Promise<void> {
    this.files.delete(key);
    this.deleted.push(key);
  }

  upload(key: string, file: StoredFile): void {
    this.files.set(key, file);
  }
}
