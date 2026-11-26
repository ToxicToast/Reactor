export const SocialPostEvents = {
  /** aktueller Stand eines Posts samt Kennzahlen */
  OBSERVED: 'observed',
  /** Abfrage fehlgeschlagen; zählt im publisher-service als Fehlversuch, nie als Messwert */
  CHECK_FAILED: 'check_failed',
} as const;
