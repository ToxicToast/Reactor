import { webhookDeliveryAnemic } from '@toxictoast/shared-webhooks-application';
import { TWITCH_DISCORD } from './twitch-discord.constant.js';
import { TWITCH_DISCORD_EMBEDS } from './twitch-discord-embeds.constant.js';

const CHANNEL = {
  channel_id: '28004350',
  channel_login: 'toxictoast',
  channel_name: 'ToxicToast',
};

const render = (eventKey: string, payload: object) => {
  return TWITCH_DISCORD_EMBEDS[eventKey](
    webhookDeliveryAnemic('delivery-1', {
      event_key: eventKey,
      payload: { ...CHANNEL, ...payload },
    }),
  );
};

describe('TWITCH_DISCORD_EMBEDS', () => {
  it('announces the stream with a link to the channel', () => {
    expect(render('twitch.stream.online', { stream_id: 's1' })).toEqual({
      color: TWITCH_DISCORD.COLOR,
      title: '🔴 ToxicToast ist jetzt live!',
      url: 'https://www.twitch.tv/toxictoast',
      description: 'Komm vorbei und sag Hallo!',
    });
  });

  it('summarizes the finished session', () => {
    const embed = render('twitch.session.ended', {
      duration_seconds: 9300,
      peak_chatters: 12,
      messages: 1234,
      unique_chatters: 9,
      follows: 2,
      subscriptions: 1,
      resubscriptions: 2,
      gifted_subs: 5,
      bits: 300,
      raids: 1,
      redemptions: 7,
    });

    expect(embed.fields?.slice(0, 3)).toEqual([
      { name: 'Dauer', value: '2 h 35 min', inline: true },
      { name: 'Subs', value: '3', inline: true },
      { name: 'Peak-Chatter', value: '12', inline: true },
    ]);
    expect(
      embed.fields?.find((field) => field.name === 'Nachrichten')?.value,
    ).toBe('1.234');
  });

  it('names anonymous cheers and leaves out empty messages', () => {
    const embed = render('twitch.community.cheer', {
      user_id: null,
      user_name: null,
      is_anonymous: true,
      bits: 100,
      message: '  ',
    });

    expect(embed.title).toBe('💎 Anonym cheert 100 Bits');
    expect(embed.description).toBeUndefined();
  });

  it('sorts poll choices by votes', () => {
    const embed = render('twitch.poll.ended', {
      poll_id: 'poll-1',
      title: 'Nächstes Spiel?',
      choices: [
        { id: 'a', title: 'Minecraft', votes: 2 },
        { id: 'b', title: 'Warcraft', votes: 7 },
      ],
      status: 'COMPLETED',
      started_at: '2026-11-04T19:00:00Z',
      ends_at: null,
      ended_at: '2026-11-04T19:05:00Z',
    });

    expect(embed.fields?.map((field) => field.name)).toEqual([
      'Warcraft',
      'Minecraft',
    ]);
  });
});
