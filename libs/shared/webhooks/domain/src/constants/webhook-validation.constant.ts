export const WEBHOOK_VALIDATION = {
  EVENT_PATTERN: /^(\*|[a-z0-9_-]+(\.[a-z0-9_-]+)*(\.\*)?)$/,
  URL_PROTOCOLS: new Set(['http:', 'https:']) as ReadonlySet<string>,
} as const;
