import { Result } from '@toxictoast/shared-kernel';
import type { RecordClickUseCase } from '@toxictoast/shortener-application';
import { LinkClickHandler } from './link-click.handler.js';

const EVENT_ID = '0192F3A0-0000-7000-8000-00000000E001';
const LINK_ID = '0192f3a0-0000-7000-8000-00000000d001';

describe('LinkClickHandler', () => {
  let execute: jest.Mock;
  let handler: LinkClickHandler;

  beforeEach(() => {
    execute = jest.fn().mockResolvedValue(Result.ok({ recorded: true }));
    handler = new LinkClickHandler({
      execute,
    } as unknown as RecordClickUseCase);
  });

  it('records the click with the id and time of the event', async () => {
    await handler.handle({
      event_id: EVENT_ID,
      occurred_at: '2026-11-25T12:00:00.000Z',
      payload: {
        link_id: LINK_ID,
        referer: 'https://www.youtube.com/',
        user_agent: 'Mozilla/5.0 (iPhone)',
        country: null,
      },
    });

    expect(execute).toHaveBeenCalledWith({
      event_id: EVENT_ID.toLowerCase(),
      clicked_at: new Date('2026-11-25T12:00:00.000Z'),
      link_id: LINK_ID,
      referer: 'https://www.youtube.com/',
      user_agent: 'Mozilla/5.0 (iPhone)',
      country: null,
    });
  });

  it('ignores events without a valid link id', async () => {
    await handler.handle({
      event_id: EVENT_ID,
      occurred_at: '2026-11-25T12:00:00.000Z',
      payload: { link_id: 'kaputt' },
    });

    expect(execute).not.toHaveBeenCalled();
  });
});
