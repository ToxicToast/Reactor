import type { ViewerCounters } from '@toxictoast/twitch-domain';

export interface ViewerDayRow extends ViewerCounters {
  channel_id: string;
  user_id: string;
  day: string;
}
