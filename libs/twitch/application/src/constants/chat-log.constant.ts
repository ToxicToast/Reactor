import { HOUR_MS } from './hour-ms.constant.js';

export const CHAT_LOG = {
  /** so weit zurück markiert ein Ban oder Timeout die Nachrichten des Users */
  CLEAR_WINDOW_MS: 24 * HOUR_MS.HOUR_MS,
  MAX_QUERY_LENGTH: 200,
} as const;
