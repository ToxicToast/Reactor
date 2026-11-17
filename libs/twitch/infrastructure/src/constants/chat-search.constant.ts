export const CHAT_SEARCH = {
  /** sprachneutral, weil im Chat Deutsch, Englisch und Emotes gemischt sind */
  TEXT_QUERY:
    "to_tsvector('simple', m.text) @@ websearch_to_tsquery('simple', :query)",
} as const;
