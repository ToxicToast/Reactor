import type { RecordAccountUseCase } from '@toxictoast/publisher-application';
import { Result } from '@toxictoast/shared-kernel';
import { SocialAccountHandler } from './social-account.handler.js';

describe('SocialAccountHandler', () => {
  it('records the account with followers and media count', async () => {
    const execute = jest
      .fn()
      .mockResolvedValue(Result.ok({ snapshot_recorded: true }));
    const handler = new SocialAccountHandler({
      execute,
    } as unknown as RecordAccountUseCase);

    await handler.handleObserved({
      occurred_at: '2026-11-25T12:00:00.000Z',
      payload: {
        platform: 'instagram',
        remote_id: 'account-1',
        handle: 'stream.toast',
        display_name: null,
        url: null,
        followers: 120,
        media_count: 40,
      },
    });

    expect(execute).toHaveBeenCalledWith({
      account: {
        platform: 'instagram',
        remote_id: 'account-1',
        handle: 'stream.toast',
        display_name: null,
        url: null,
      },
      metrics: { followers: 120, media_count: 40 },
      observed_at: new Date('2026-11-25T12:00:00.000Z'),
    });
  });
});
