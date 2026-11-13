import type { Metadata } from '@grpc/grpc-js';
import type { ClientGrpc } from '@nestjs/microservices';
import type { DomainContext } from '@toxictoast/shared-kernel';
import { CorrelationContext } from '@toxictoast/shared-system';
import { UnrecoverableError, type Job } from 'bullmq';
import { of } from 'rxjs';
import { TwitchProcessor } from './twitch.processor.js';

const ACTOR_ID = '0192f3a0-0000-7000-8000-0000000000c0';
const CID = '01a16a00-0000-7000-8000-000000000001';

describe('TwitchProcessor', () => {
  let purge: jest.Mock;
  let processor: TwitchProcessor;

  beforeEach(() => {
    purge = jest.fn().mockReturnValue(of({ removed: 7 }));
    const client = {
      getService: () => ({ purgeExpiredChatMessages: purge }),
    } as unknown as ClientGrpc;
    const ctx = { id: { generate: () => CID } } as unknown as DomainContext;
    processor = new TwitchProcessor(
      client,
      ACTOR_ID,
      ctx,
      new CorrelationContext(),
    );
  });

  it('purges expired chat messages and returns the count', async () => {
    const result = await processor.process({
      name: 'chat.purge-expired',
    } as Job);

    expect(result).toEqual({ removed: 7 });
  });

  it('calls twitch as system actor with only the purge permission', async () => {
    await processor.process({ name: 'chat.purge-expired' } as Job);

    const metadata = purge.mock.calls[0][1] as Metadata;
    expect(metadata.get('x-actor-type')).toEqual(['system']);
    expect(metadata.get('x-actor-id')).toEqual([ACTOR_ID]);
    expect(metadata.get('x-actor-permissions')).toEqual(['twitch.chat.purge']);
    expect(metadata.get('x-correlation-id')).toEqual([CID]);
  });

  it('does not retry unknown jobs', async () => {
    await expect(
      processor.process({ name: 'unknown' } as Job),
    ).rejects.toBeInstanceOf(UnrecoverableError);
  });
});
