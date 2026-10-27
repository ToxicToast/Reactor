import {
  InMemoryTwitchChannelRepository,
  RecordingTwitchEventSubscriber,
  twitchChannelAnemic,
} from '../testing/index.js';
import { ResumeSubscriptionsUseCase } from './resume-subscriptions.usecase.js';

describe('ResumeSubscriptionsUseCase', () => {
  it('starts every connected channel and keeps going when one fails', async () => {
    const repository = new InMemoryTwitchChannelRepository();
    const subscriber = new RecordingTwitchEventSubscriber();
    await repository.save(twitchChannelAnemic('channel-1', { login: 'eins' }));
    await repository.save(twitchChannelAnemic('channel-2', { login: 'zwei' }));
    await repository.save(
      twitchChannelAnemic('channel-3', { login: 'drei', connected: false }),
    );
    subscriber.failFor.add('channel-1');

    const result = await new ResumeSubscriptionsUseCase(
      repository,
      subscriber,
    ).execute();

    expect(result.value).toEqual({ started: ['zwei'], failed: ['eins'] });
    expect(subscriber.started).toEqual(['channel-2']);
  });
});
