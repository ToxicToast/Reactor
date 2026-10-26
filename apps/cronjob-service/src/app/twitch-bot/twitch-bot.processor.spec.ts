import type { Metadata } from '@grpc/grpc-js';
import type { ClientGrpc } from '@nestjs/microservices';
import type { DomainContext } from '@toxictoast/shared-kernel';
import { CorrelationContext } from '@toxictoast/shared-system';
import { UnrecoverableError, type Job } from 'bullmq';
import { of } from 'rxjs';
import { TwitchBotProcessor } from './twitch-bot.processor.js';

const ACTOR_ID = '0192f3a0-0000-7000-8000-0000000000c0';
const CID = '01a16a00-0000-7000-8000-000000000001';

describe('TwitchBotProcessor', () => {
  let syncChatters: jest.Mock;
  let syncClips: jest.Mock;
  let processor: TwitchBotProcessor;

  beforeEach(() => {
    syncChatters = jest.fn().mockReturnValue(of({ joined: 2, left: 1 }));
    syncClips = jest.fn().mockReturnValue(of({ created: 3 }));
    const client = {
      getService: () => ({ syncChatters, syncClips }),
    } as unknown as ClientGrpc;
    const ctx = { id: { generate: () => CID } } as unknown as DomainContext;
    processor = new TwitchBotProcessor(
      client,
      ACTOR_ID,
      ctx,
      new CorrelationContext(),
    );
    processor.onModuleInit();
  });

  it('syncs the chatters', async () => {
    const result = await processor.process({ name: 'chatters.sync' } as Job);

    expect(result).toEqual({ joined: 2, left: 1 });
  });

  it('syncs the clips', async () => {
    const result = await processor.process({ name: 'clips.sync' } as Job);

    expect(result).toEqual({ created: 3 });
  });

  it('calls the bot as system actor with only the sync permission', async () => {
    await processor.process({ name: 'chatters.sync' } as Job);

    const metadata = syncChatters.mock.calls[0][1] as Metadata;
    expect(metadata.get('x-actor-type')).toEqual(['system']);
    expect(metadata.get('x-actor-id')).toEqual([ACTOR_ID]);
    expect(metadata.get('x-actor-permissions')).toEqual(['twitch-bot.sync']);
    expect(metadata.get('x-correlation-id')).toEqual([CID]);
  });

  it('does not retry unknown jobs', async () => {
    await expect(
      processor.process({ name: 'unknown' } as Job),
    ).rejects.toBeInstanceOf(UnrecoverableError);
  });
});
