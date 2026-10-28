import type { UnitOfWork, UseCase } from '@toxictoast/shared-application';
import { DomainError, eventKey, Result } from '@toxictoast/shared-kernel';
import type {
  DispatchWebhookEventUseCase,
  WebhookEvent,
} from '@toxictoast/shared-webhooks-application';
import {
  ObservationKinds,
  type ChannelDirectoryRepository,
  type PollRepository,
  type StreamSessionFactory,
  type StreamSessionRepository,
  type TwitchObservation,
} from '@toxictoast/twitch-domain';
import { LIVE_OBSERVATION_KINDS } from '../constants/index.js';
import type {
  RecordTwitchEventInput,
  RecordTwitchEventOutput,
} from '../data/index.js';
import { expectSuccess } from '../functions/index.js';
import type {
  RecordedTwitchEvent,
  TwitchEventLog,
  TwitchFeed,
} from '../interfaces/index.js';
import type {
  CounterRecorder,
  LiveStatusReader,
  PresenceTracker,
  SessionTracker,
} from '../services/index.js';

export class RecordTwitchEventUseCase implements UseCase<
  RecordTwitchEventInput,
  RecordTwitchEventOutput
> {
  constructor(
    private readonly eventLog: TwitchEventLog,
    private readonly directory: ChannelDirectoryRepository,
    private readonly factory: StreamSessionFactory,
    private readonly sessions: StreamSessionRepository,
    private readonly polls: PollRepository,
    private readonly sessionTracker: SessionTracker,
    private readonly presenceTracker: PresenceTracker,
    private readonly counters: CounterRecorder,
    private readonly webhooks: DispatchWebhookEventUseCase,
    private readonly liveStatus: LiveStatusReader,
    private readonly feed: TwitchFeed,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(
    input: RecordTwitchEventInput,
  ): Promise<Result<RecordTwitchEventOutput>> {
    let recorded: boolean;
    try {
      recorded = await this.uow.run(() => this.recordOnce(input));
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        return Result.fail(error);
      }
      throw error;
    }

    if (recorded) {
      await this.notify(input);
    }
    return Result.ok({ recorded });
  }

  private async recordOnce(input: RecordTwitchEventInput): Promise<boolean> {
    if (!(await this.eventLog.record(input.event))) {
      return false;
    }
    if (input.observation) {
      await this.apply(input.observation);
    }
    expectSuccess(await this.webhooks.execute(this.webhookEvent(input.event)));
    return true;
  }

  private async apply(observation: TwitchObservation): Promise<void> {
    await this.directory.remember(observation.channel, observation.occurred_at);

    switch (observation.kind) {
      case ObservationKinds.STREAM_ONLINE:
        return this.sessionTracker.online(observation);
      case ObservationKinds.STREAM_OFFLINE:
        return this.sessionTracker.offline(observation);
      case ObservationKinds.POLL:
        if (observation.poll) {
          await this.polls.save(
            observation.channel.channel_id,
            observation.poll,
          );
        }
        return;
      default:
        return this.applyToLiveSession(observation);
    }
  }

  private async applyToLiveSession(
    observation: TwitchObservation,
  ): Promise<void> {
    const anemic = await this.sessions.findLive(observation.channel.channel_id);
    const session = anemic ? this.factory.reconstitute(anemic) : null;

    switch (observation.kind) {
      case ObservationKinds.JOIN:
        await this.presenceTracker.join(observation, session);
        break;
      case ObservationKinds.LEAVE:
        await this.presenceTracker.leave(observation, session);
        break;
      default:
        await this.counters.record(observation, session);
    }

    if (session) {
      await this.sessions.save(this.factory.constitute(session));
    }
  }

  private webhookEvent(event: RecordedTwitchEvent): WebhookEvent {
    return {
      event_id: event.event_id,
      event_key: eventKey(event.topic, event.name),
      occurred_at: event.occurred_at,
      payload: event.payload,
    };
  }

  private async notify(input: RecordTwitchEventInput): Promise<void> {
    await this.feed.publishEvent(input.event);
    if (
      input.observation &&
      LIVE_OBSERVATION_KINDS.has(input.observation.kind)
    ) {
      await this.feed.publishLive(await this.liveStatus.read());
    }
  }
}
