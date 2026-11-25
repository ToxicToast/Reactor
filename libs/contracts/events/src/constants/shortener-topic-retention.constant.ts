import { TIME_MS } from '@toxictoast/shared-types';
import { ShortenerTopics } from './shortener-topics.constant.js';

/** Rohdaten der Klicks nur eine Woche; dauerhaft bleiben die Tagesaggregate im shortener-service */
export const SHORTENER_TOPIC_RETENTION_MS: Readonly<Record<string, number>> = {
  [ShortenerTopics.CLICK]: 7 * TIME_MS.DAY,
};
