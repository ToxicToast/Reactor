/** Upload gleich mit, damit beim Veröffentlichen später niemand neu verbinden muss */
export const YOUTUBE_SCOPES: ReadonlyArray<string> = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
];
