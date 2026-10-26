import type { ApiClient } from '@twurple/api';
import type { EventSubWsListener } from '@twurple/eventsub-ws';

export const createEventSubListener = async (
  apiClient: ApiClient,
): Promise<EventSubWsListener> => {
  const eventsub = await import('@twurple/eventsub-ws');
  return new eventsub.EventSubWsListener({ apiClient });
};
