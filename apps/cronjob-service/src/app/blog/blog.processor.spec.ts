import type { Metadata } from '@grpc/grpc-js';
import type { ClientGrpc } from '@nestjs/microservices';
import { UnrecoverableError, type Job } from 'bullmq';
import { of } from 'rxjs';
import { BlogProcessor } from './blog.processor.js';

const ACTOR_ID = '0192f3a0-0000-7000-8000-0000000000c0';

describe('BlogProcessor', () => {
  let cleanup: jest.Mock;
  let processor: BlogProcessor;

  beforeEach(() => {
    cleanup = jest.fn().mockReturnValue(of({ removed: 2 }));
    const client = {
      getService: () => ({ cleanupPendingMedia: cleanup }),
    } as unknown as ClientGrpc;
    processor = new BlogProcessor(client, ACTOR_ID);
    processor.onModuleInit();
  });

  it('cleans up pending media and returns the count', async () => {
    const result = await processor.process({ name: 'media.cleanup' } as Job);

    expect(result).toEqual({ removed: 2 });
  });

  it('calls the blog as system actor with only the delete permission', async () => {
    await processor.process({ name: 'media.cleanup' } as Job);

    const metadata = cleanup.mock.calls[0][1] as Metadata;
    expect(metadata.get('x-actor-type')).toEqual(['system']);
    expect(metadata.get('x-actor-id')).toEqual([ACTOR_ID]);
    expect(metadata.get('x-actor-permissions')).toEqual(['blog.media.delete']);
  });

  it('does not retry unknown jobs', async () => {
    await expect(
      processor.process({ name: 'unknown' } as Job),
    ).rejects.toBeInstanceOf(UnrecoverableError);
  });
});
