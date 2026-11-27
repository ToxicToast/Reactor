import { oauthTokenSchema } from '@toxictoast/shared-persistence';

export const TwitchTokenSchema = oauthTokenSchema({
  name: 'TwitchToken',
  tableName: 'twitch_tokens',
  ownerColumn: 'channel_id',
});
