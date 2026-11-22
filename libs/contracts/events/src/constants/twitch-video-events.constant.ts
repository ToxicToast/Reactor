export const TwitchVideoEvents = {
  /** neues Archiv; entsteht schon beim Streamstart */
  CREATED: 'created',
  /** neues Highlight oder neuer Upload */
  PUBLISHED: 'published',
  /** beim einmaligen Import; ohne Benachrichtigung */
  FOUND: 'found',
  /** Archiv nach Streamende mit endgültiger Länge */
  UPDATED: 'updated',
} as const;
