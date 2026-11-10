import type { StreamSessionId } from '../types/index.js';

export interface ChatterActivityRepository {
  /** true, wenn der Zuschauer an diesem Tag zum ersten Mal geschrieben hat */
  markDaily(channelId: string, day: string, userId: string): Promise<boolean>;
  /** true, wenn der Zuschauer in dieser Session zum ersten Mal geschrieben hat */
  markSession(sessionId: StreamSessionId, userId: string): Promise<boolean>;
}
