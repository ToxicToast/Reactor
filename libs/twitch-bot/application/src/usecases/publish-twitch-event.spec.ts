import {
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application';
import {
  createTestContext,
  TEST_NOW,
  twitchChannelAnemic,
} from '../testing/index.js';
import { PublishTwitchEventUseCase } from './publish-twitch-event.usecase.js';

describe('PublishTwitchEventUseCase', () => {
  it('writes the event with the channel reference into the outbox', async () => {
    const outbox = new InMemoryOutbox();
    const uow = new ImmediateUnitOfWork();
    const useCase = new PublishTwitchEventUseCase(
      outbox,
      uow,
      createTestContext(),
    );

    const result = await useCase.execute({
      channel: twitchChannelAnemic('channel-1'),
      topic: 'twitch.chat',
      name: 'message',
      payload: { message_id: 'msg-1', text: 'Hallo' },
    });

    expect(result.isSuccess).toBe(true);
    expect(uow.runs).toBe(1);
    expect(outbox.events).toEqual([
      expect.objectContaining({
        event_namespace: 'twitch.chat',
        event_name: 'message',
        event_version: 1,
        aggregate_id: 'channel-1',
        occurred_at: TEST_NOW,
        payload: {
          channel_id: '123456',
          channel_login: 'toxictoast',
          channel_name: 'ToxicToast',
          message_id: 'msg-1',
          text: 'Hallo',
        },
      }),
    ]);
  });
});
