import type { MediaId } from '../types/index.js';

/** merkt sich, welche Medien eine öffentliche Kopie haben */
export interface PublicMediaRepository {
  findAll(): Promise<Array<MediaId>>;
  add(id: MediaId, at: Date): Promise<void>;
  remove(id: MediaId): Promise<void>;
}
