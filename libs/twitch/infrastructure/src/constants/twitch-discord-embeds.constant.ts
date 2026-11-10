import {
  TwitchClipEvents,
  TwitchCommunityEvents,
  TwitchPollEvents,
  TwitchRedemptionEvents,
  TwitchSessionEvents,
  TwitchStatsTopics,
  TwitchStreamEvents,
  TwitchTopics,
} from '@toxictoast/contracts-events';
import { eventKey } from '@toxictoast/shared-kernel';
import {
  DISCORD,
  type DiscordEmbedRenderers,
} from '@toxictoast/shared-webhooks-infrastructure';
import { countField } from '../functions/count-field.function.js';
import { formatDuration } from '../functions/format-duration.function.js';
import { optionalText } from '../functions/optional-text.function.js';
import { subTierName } from '../functions/sub-tier-name.function.js';
import { twitchChannelUrl } from '../functions/twitch-channel-url.function.js';
import { twitchEmbed } from '../functions/twitch-embed.function.js';
import { viewerName } from '../functions/viewer-name.function.js';

const SESSION_COUNTS = [
  ['Peak-Chatter', 'peak_chatters'],
  ['Nachrichten', 'messages'],
  ['Unique Chatter', 'unique_chatters'],
  ['Follows', 'follows'],
  ['Gifted Subs', 'gifted_subs'],
  ['Bits', 'bits'],
  ['Raids', 'raids'],
  ['Einlösungen', 'redemptions'],
] as const;

export const TWITCH_DISCORD_EMBEDS: DiscordEmbedRenderers = {
  // ── Stream ────────────────────────────────────
  [eventKey(TwitchTopics.STREAM, TwitchStreamEvents.ONLINE)]: twitchEmbed(
    (payload) => {
      return {
        title: `🔴 ${payload.string('channel_name')} ist jetzt live!`,
        url: twitchChannelUrl(payload.string('channel_login')),
        description: 'Komm vorbei und sag Hallo!',
      };
    },
  ),
  [eventKey(TwitchStatsTopics.SESSION, TwitchSessionEvents.ENDED)]: twitchEmbed(
    (payload) => {
      return {
        title: `Stream von ${payload.string('channel_name')} beendet`,
        url: twitchChannelUrl(payload.string('channel_login')),
        fields: [
          {
            name: 'Dauer',
            value: payload.has('duration_seconds')
              ? formatDuration(payload.number('duration_seconds'))
              : DISCORD.EMPTY_VALUE,
            inline: true,
          },
          countField(
            'Subs',
            payload.number('subscriptions') + payload.number('resubscriptions'),
          ),
          ...SESSION_COUNTS.map(([name, key]) => {
            return countField(name, payload.number(key));
          }),
        ],
      };
    },
  ),

  // ── Community ─────────────────────────────────
  [eventKey(TwitchTopics.COMMUNITY, TwitchCommunityEvents.FOLLOW)]: twitchEmbed(
    (payload) => {
      return { title: `💜 ${payload.string('user_name')} folgt jetzt` };
    },
  ),
  [eventKey(TwitchTopics.COMMUNITY, TwitchCommunityEvents.SUBSCRIBE)]:
    twitchEmbed((payload) => {
      const gifted = payload.boolean('is_gift') ? ' (geschenkt)' : '';
      return {
        title: `⭐ ${payload.string('user_name')} hat abonniert${gifted}`,
        fields: [
          {
            name: 'Stufe',
            value: subTierName(payload.string('tier')),
            inline: true,
          },
        ],
      };
    }),
  [eventKey(TwitchTopics.COMMUNITY, TwitchCommunityEvents.RESUBSCRIBE)]:
    twitchEmbed((payload) => {
      return {
        title: `⭐ ${payload.string('user_name')} abonniert seit ${payload.number('cumulative_months')} Monaten`,
        description: optionalText(payload.string('message')),
        fields: [
          {
            name: 'Stufe',
            value: subTierName(payload.string('tier')),
            inline: true,
          },
        ],
      };
    }),
  [eventKey(TwitchTopics.COMMUNITY, TwitchCommunityEvents.GIFT)]: twitchEmbed(
    (payload) => {
      return {
        title: `🎁 ${viewerName(payload)} verschenkt ${payload.number('total')} Subs`,
        fields: [
          {
            name: 'Stufe',
            value: subTierName(payload.string('tier')),
            inline: true,
          },
        ],
      };
    },
  ),
  [eventKey(TwitchTopics.COMMUNITY, TwitchCommunityEvents.RAID)]: twitchEmbed(
    (payload) => {
      return {
        title: `🚀 Raid von ${payload.string('from_channel_name')}`,
        url: twitchChannelUrl(payload.string('from_channel_login')),
        description: `mit ${payload.number('viewers').toLocaleString('de-DE')} Zuschauern`,
      };
    },
  ),
  [eventKey(TwitchTopics.COMMUNITY, TwitchCommunityEvents.CHEER)]: twitchEmbed(
    (payload) => {
      return {
        title: `💎 ${viewerName(payload)} cheert ${payload.number('bits').toLocaleString('de-DE')} Bits`,
        description: optionalText(payload.string('message')),
      };
    },
  ),

  // ── Kanalpunkte und Umfragen ──────────────────
  [eventKey(TwitchTopics.REDEMPTION, TwitchRedemptionEvents.REDEEMED)]:
    twitchEmbed((payload) => {
      return {
        title: `🎯 ${payload.string('user_name')} löst „${payload.string('reward_title')}“ ein`,
        description: optionalText(payload.string('user_input')),
      };
    }),
  [eventKey(TwitchTopics.POLL, TwitchPollEvents.ENDED)]: twitchEmbed(
    (payload) => {
      const choices = payload
        .list('choices')
        .sort((a, b) => b.number('votes') - a.number('votes'));
      return {
        title: `📊 Umfrage beendet: ${payload.string('title')}`,
        fields: choices.map((choice) => {
          return {
            name: choice.string('title'),
            value: `${choice.number('votes').toLocaleString('de-DE')} Stimmen`,
            inline: true,
          };
        }),
      };
    },
  ),

  // ── Clips ─────────────────────────────────────
  [eventKey(TwitchTopics.CLIP, TwitchClipEvents.CREATED)]: twitchEmbed(
    (payload) => {
      return {
        title: `🎬 ${payload.string('title')}`,
        url: payload.string('url'),
        description: `Clip von ${payload.string('creator_name')}`,
        image: { url: payload.string('thumbnail_url') },
        fields: [
          {
            name: 'Länge',
            value: `${Math.round(payload.number('duration_seconds'))} s`,
            inline: true,
          },
        ],
      };
    },
  ),
};
