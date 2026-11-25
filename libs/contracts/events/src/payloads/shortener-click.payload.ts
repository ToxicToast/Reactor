import type { Nullable } from '@toxictoast/shared-types';

/** Rohdaten ohne IP; ausgewertet wird im shortener-service */
export interface ShortenerClickPayloadV1 {
  readonly link_id: string;
  readonly referer: Nullable<string>;
  readonly user_agent: Nullable<string>;
  /** ISO-3166-Alpha-2; null, solange GeoIP fehlt oder nichts findet */
  readonly country: Nullable<string>;
}
