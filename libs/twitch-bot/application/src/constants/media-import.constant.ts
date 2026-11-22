export const MEDIA_IMPORT = {
  /** Twitch hat Clips im Mai 2016 eingeführt */
  CLIPS_SINCE: new Date('2016-05-01T00:00:00Z'),
  /** Helix liefert pro Zeitraum nur begrenzt viele Clips */
  CLIP_WINDOW_DAYS: 30,
  /** so viele neueste VODs prüft der 5-Minuten-Lauf */
  RECENT_VIDEOS: 20,
} as const;
