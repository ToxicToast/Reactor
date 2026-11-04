export const TWITCH_DISCORD = {
  COLOR: 0x9146ff,
  BASE_URL: 'https://www.twitch.tv',
  ANONYMOUS: 'Anonym',
  SUB_TIERS: {
    '1000': 'Tier 1',
    '2000': 'Tier 2',
    '3000': 'Tier 3',
  } as Readonly<Record<string, string>>,
} as const;
