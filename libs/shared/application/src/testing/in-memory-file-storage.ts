import type { Nullable } from '@toxictoast/shared-types';
import type { FileStorage, StoredFile } from '../interfaces/index.js';

export class InMemoryFileStorage implements FileStorage {
  readonly files = new Map<string, StoredFile>();
  readonly deleted: Array<string> = [];
  readonly copies: Array<{ from: string; to: string }> = [];

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

  async copy(fromKey: string, toKey: string): Promise<void> {
    const file = this.files.get(fromKey);
    if (file) {
      this.files.set(toKey, file);
    }
    this.copies.push({ from: fromKey, to: toKey });
  }

  publicUrl(key: string): string {
    return `https://storage.test/bucket/${key}`;
  }

  upload(key: string, file: StoredFile): void {
    this.files.set(key, file);
  }
}
