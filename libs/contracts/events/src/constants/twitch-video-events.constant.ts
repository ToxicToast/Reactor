export const TwitchVideoEvents = {
  CREATED: 'created',
  /** beim einmaligen Import; ohne Benachrichtigung */
  FOUND: 'found',
  /** Archiv nach Streamende mit endgültiger Länge */
  UPDATED: 'updated',
} as const;
