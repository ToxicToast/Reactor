/** grob, aber ohne Fremdbibliothek; Reihenfolge der Prüfung: Bot, Tablet, Mobil, sonst Desktop */
export const CLICK_PATTERNS = {
  BOT: /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|curl|wget|python-requests|okhttp|headless/i,
  TABLET: /ipad|tablet|kindle|silk/i,
  MOBILE: /mobi|iphone|ipod|android|windows phone/i,
} as const;
