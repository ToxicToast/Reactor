/** null heißt: die Plattform kennt die Kennzahl nicht; 0 heißt: gemessen und null */
export const POST_METRIC_KEYS = [
  'views',
  'likes',
  'comments',
  'shares',
  'saves',
  'reach',
  /** durchschnittliche Wiedergabedauer pro Aufruf */
  'avg_watch_time_ms',
  /** gesamte Abspielzeit inklusive Wiederholungen */
  'total_watch_time_ms',
  'avg_view_percentage',
  'followers_gained',
] as const;
