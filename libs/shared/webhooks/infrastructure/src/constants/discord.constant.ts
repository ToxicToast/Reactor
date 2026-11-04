export const DISCORD = {
  LIMITS: {
    TITLE: 256,
    DESCRIPTION: 4096,
    FIELDS: 25,
    FIELD_NAME: 256,
    FIELD_VALUE: 1024,
    FOOTER: 2048,
    /** Platz für den Payload im allgemeinen Embed, bleibt deutlich unter DESCRIPTION */
    GENERIC_PAYLOAD: 1800,
  },
  /** Discord lehnt leere Feldwerte ab */
  EMPTY_VALUE: '–',
  FENCE: '```',
} as const;
