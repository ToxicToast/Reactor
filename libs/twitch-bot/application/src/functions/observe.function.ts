import type { DomainContext } from '@toxictoast/shared-kernel';
import type { TrackedChannel } from '@toxictoast/twitch-bot-domain';
import { TwitchObservedEvent } from '../events/index.js';
import type { ChannelReference } from '../interfaces/index.js';
import { channelReference } from './channel-reference.function.js';

export const observe = <TPayload extends object>(
  ctx: DomainContext,
  channel: TrackedChannel,
  topic: string,
  name: string,
  payload: TPayload,
): TwitchObservedEvent<ChannelReference & TPayload> => {
  return new TwitchObservedEvent(
    ctx.id.generate(),
    topic,
    name,
    channel.id,
    ctx.date.now(),
    { ...channelReference(channel), ...payload },
  );
};
