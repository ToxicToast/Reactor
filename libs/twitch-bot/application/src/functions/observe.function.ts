import { ObservedEvent } from '@toxictoast/shared-application';
import type { DomainContext } from '@toxictoast/shared-kernel';
import type { TrackedChannel } from '@toxictoast/twitch-bot-domain';
import type { ChannelReference } from '../interfaces/index.js';
import { channelReference } from './channel-reference.function.js';

export const observe = <TPayload extends object>(
  ctx: DomainContext,
  channel: TrackedChannel,
  topic: string,
  name: string,
  payload: TPayload,
): ObservedEvent<ChannelReference & TPayload> => {
  return new ObservedEvent(
    ctx.id.generate(),
    topic,
    name,
    channel.id,
    ctx.date.now(),
    { ...channelReference(channel), ...payload },
  );
};
