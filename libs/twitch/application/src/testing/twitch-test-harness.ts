import {
  DomainPersistence,
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application';
import {
  DispatchWebhookEventUseCase,
  InMemoryWebhookDeliveryRepository,
  InMemoryWebhookRepository,
} from '@toxictoast/shared-webhooks-application';
import { WebhookDeliveryFactory } from '@toxictoast/shared-webhooks-domain';
import { StreamSessionFactory } from '@toxictoast/twitch-domain';
import {
  CounterRecorder,
  LiveStatusReader,
  PresenceTracker,
  SessionTracker,
} from '../services/index.js';
import { RecordTwitchEventUseCase } from '../usecases/index.js';
import { InMemoryChannelDirectoryRepository } from './in-memory-channel-directory.repository.js';
import { InMemoryChannelStatsRepository } from './in-memory-channel-stats.repository.js';
import { InMemoryChatterActivityRepository } from './in-memory-chatter-activity.repository.js';
import { InMemoryPollRepository } from './in-memory-poll.repository.js';
import { InMemoryPresenceRepository } from './in-memory-presence.repository.js';
import { InMemoryRewardStatsRepository } from './in-memory-reward-stats.repository.js';
import { InMemoryStreamSessionRepository } from './in-memory-stream-session.repository.js';
import { InMemoryTwitchEventLog } from './in-memory-twitch-event-log.js';
import { InMemoryViewerStatsRepository } from './in-memory-viewer-stats.repository.js';
import { RecordingTwitchFeed } from './recording-twitch-feed.js';
import { createTwitchTestContext, TWITCH_TEST_CONFIG } from './test-context.js';

export class TwitchTestHarness {
  readonly ctx = createTwitchTestContext();
  readonly config = TWITCH_TEST_CONFIG;
  readonly eventLog = new InMemoryTwitchEventLog();
  readonly directory = new InMemoryChannelDirectoryRepository();
  readonly sessions = new InMemoryStreamSessionRepository();
  readonly channelStats = new InMemoryChannelStatsRepository();
  readonly viewerStats = new InMemoryViewerStatsRepository();
  readonly chatters = new InMemoryChatterActivityRepository();
  readonly presence = new InMemoryPresenceRepository();
  readonly rewards = new InMemoryRewardStatsRepository();
  readonly polls = new InMemoryPollRepository();
  readonly webhooks = new InMemoryWebhookRepository();
  readonly deliveries = new InMemoryWebhookDeliveryRepository();
  readonly outbox = new InMemoryOutbox();
  readonly feed = new RecordingTwitchFeed();
  readonly uow = new ImmediateUnitOfWork();
  readonly sessionFactory = new StreamSessionFactory(this.ctx);
  readonly liveStatus = new LiveStatusReader(
    this.directory,
    this.sessions,
    this.presence,
  );
  readonly sessionTracker = new SessionTracker(
    this.sessionFactory,
    this.sessions,
    this.presence,
    this.channelStats,
    this.viewerStats,
    new DomainPersistence(this.outbox, this.uow),
    this.config,
  );
  readonly record = new RecordTwitchEventUseCase(
    this.eventLog,
    this.directory,
    this.sessionFactory,
    this.sessions,
    this.polls,
    this.sessionTracker,
    new PresenceTracker(
      this.presence,
      this.channelStats,
      this.viewerStats,
      this.sessionTracker,
      this.config,
    ),
    new CounterRecorder(
      this.channelStats,
      this.viewerStats,
      this.chatters,
      this.rewards,
      this.config,
    ),
    new DispatchWebhookEventUseCase(
      new WebhookDeliveryFactory(this.ctx),
      this.webhooks,
      this.deliveries,
    ),
    this.liveStatus,
    this.feed,
    this.uow,
  );
}
