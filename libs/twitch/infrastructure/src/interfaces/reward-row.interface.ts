import type { RewardRef } from '@toxictoast/twitch-domain';

export interface RewardRow extends RewardRef {
  channel_id: string;
}
