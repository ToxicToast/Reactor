import { TwitchTestHarness } from '@toxictoast/twitch-application';
import { incomingTwitchEvent, TEST_VIEWER } from '../testing/index.js';
import { TwitchEventHandler } from './twitch-event.handler.js';

describe('TwitchEventHandler', () => {
  let harness: TwitchTestHarness;
  let handler: TwitchEventHandler;

  beforeEach(() => {
    harness = new TwitchTestHarness();
    handler = new TwitchEventHandler(harness.record);
  });

  it('records valid events', async () => {
    await handler.handle(
      incomingTwitchEvent('twitch.chat', 'message', {
        ...TEST_VIEWER,
        message_id: 'message-1',
        text: 'Hallo',
        color: null,
        badges: [],
        bits: 0,
        reply_to_message_id: null,
      }),
    );

    expect(harness.channelStats.counters('123456', '2026-10-28').messages).toBe(
      1,
    );
    expect(harness.chatMessages.items.get('message-1')?.text).toBe('Hallo');
    expect(harness.eventLog.events.size).toBe(1);
  });

  it('skips malformed events instead of blocking the consumer', async () => {
    await expect(
      handler.handle(
        incomingTwitchEvent('twitch.chat', 'message', { user_id: 42 }),
      ),
    ).resolves.toBeUndefined();

    expect(harness.eventLog.events.size).toBe(0);
  });
});
