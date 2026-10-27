import { TwitchSocketTracker } from '@toxictoast/twitch-bot-infrastructure';
import { Registry } from 'prom-client';
import { PrometheusTwitchBotMetrics } from './prometheus-twitch-bot.metrics.js';

describe('PrometheusTwitchBotMetrics', () => {
  let registry: Registry;
  let sockets: TwitchSocketTracker;
  let metrics: PrometheusTwitchBotMetrics;

  beforeEach(() => {
    registry = new Registry();
    sockets = new TwitchSocketTracker({ now: () => new Date() });
    metrics = new PrometheusTwitchBotMetrics(registry, sockets);
  });

  it('counts received events per channel and topic', async () => {
    metrics.eventReceived('toxictoast', 'twitch.chat', 'message');
    metrics.eventReceived('toxictoast', 'twitch.chat', 'message');

    expect(
      await registry.getSingleMetricAsString('twitch_events_received_total'),
    ).toContain(
      'twitch_events_received_total{channel="toxictoast",topic="twitch.chat",name="message"} 2',
    );
  });

  it('counts token refreshes by result', async () => {
    metrics.tokenRefreshed(true);
    metrics.tokenRefreshed(false);

    const output = await registry.getSingleMetricAsString(
      'twitch_token_refreshes_total',
    );
    expect(output).toContain(
      'twitch_token_refreshes_total{result="success"} 1',
    );
    expect(output).toContain(
      'twitch_token_refreshes_total{result="failure"} 1',
    );
  });

  it('reports the socket state of every channel', async () => {
    sockets.track('1', 'toxictoast');
    sockets.track('2', 'codemechanicus');
    sockets.connected('1');

    const output = await registry.getSingleMetricAsString(
      'twitch_eventsub_socket_connected',
    );
    expect(output).toContain(
      'twitch_eventsub_socket_connected{channel="toxictoast"} 1',
    );
    expect(output).toContain(
      'twitch_eventsub_socket_connected{channel="codemechanicus"} 0',
    );
  });
});
