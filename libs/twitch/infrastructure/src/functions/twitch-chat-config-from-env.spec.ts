import { twitchChatConfigFromEnv } from './twitch-chat-config-from-env.function.js';

describe('twitchChatConfigFromEnv', () => {
  it('defaults to 365 days', () => {
    expect(twitchChatConfigFromEnv({})).toEqual({ retention_days: 365 });
  });

  it('reads the retention from the environment', () => {
    expect(
      twitchChatConfigFromEnv({ TWITCH_CHAT_RETENTION_DAYS: '90' }),
    ).toEqual({ retention_days: 90 });
  });

  it.each(['0', '-5', '1.5'])('refuses %s days', (value) => {
    expect(() =>
      twitchChatConfigFromEnv({ TWITCH_CHAT_RETENTION_DAYS: value }),
    ).toThrow('TWITCH_CHAT_RETENTION_DAYS');
  });
});
