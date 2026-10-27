import type { TwitchBotMetrics } from '@toxictoast/twitch-bot-infrastructure';
import type { TwitchSocketTracker } from '@toxictoast/twitch-bot-infrastructure';
import { Counter, Gauge, type Registry } from 'prom-client';

type EventLabels = 'channel' | 'topic' | 'name';

export class PrometheusTwitchBotMetrics implements TwitchBotMetrics {
  private readonly received: Counter<EventLabels>;
  private readonly publishFailures: Counter<EventLabels>;
  private readonly subscriptionFailures: Counter;
  private readonly revocations: Counter<'status'>;
  private readonly refreshes: Counter<'result'>;

  constructor(registry: Registry, sockets: TwitchSocketTracker) {
    this.received = new Counter({
      name: 'twitch_events_received_total',
      help: 'Twitch events received over EventSub',
      labelNames: ['channel', 'topic', 'name'],
      registers: [registry],
    });
    this.publishFailures = new Counter({
      name: 'twitch_event_publish_failures_total',
      help: 'Twitch events that could not be written to the outbox',
      labelNames: ['channel', 'topic', 'name'],
      registers: [registry],
    });
    this.subscriptionFailures = new Counter({
      name: 'twitch_subscription_failures_total',
      help: 'EventSub subscriptions Twitch refused to create',
      registers: [registry],
    });
    this.revocations = new Counter({
      name: 'twitch_subscription_revocations_total',
      help: 'EventSub subscriptions revoked by Twitch',
      labelNames: ['status'],
      registers: [registry],
    });
    this.refreshes = new Counter({
      name: 'twitch_token_refreshes_total',
      help: 'Twitch token refreshes by result',
      labelNames: ['result'],
      registers: [registry],
    });
    new Gauge({
      name: 'twitch_eventsub_socket_connected',
      help: 'Whether the EventSub socket of a channel is connected (1) or not (0)',
      labelNames: ['channel'],
      registers: [registry],
      collect() {
        this.reset();
        for (const socket of sockets.snapshot()) {
          this.set({ channel: socket.login }, socket.connected ? 1 : 0);
        }
      },
    });
  }

  eventReceived(channel: string, topic: string, name: string): void {
    this.received.inc({ channel, topic, name });
  }

  eventPublishFailed(channel: string, topic: string, name: string): void {
    this.publishFailures.inc({ channel, topic, name });
  }

  subscriptionFailed(): void {
    this.subscriptionFailures.inc();
  }

  subscriptionRevoked(status: string): void {
    this.revocations.inc({ status });
  }

  tokenRefreshed(success: boolean): void {
    this.refreshes.inc({ result: success ? 'success' : 'failure' });
  }
}
