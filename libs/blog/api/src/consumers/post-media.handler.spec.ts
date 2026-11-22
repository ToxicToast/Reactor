import type { SyncPublicMediaUseCase } from '@toxictoast/blog-application';
import { Result } from '@toxictoast/shared-kernel';
import { PostMediaHandler } from './post-media.handler.js';

const IMAGE = '0192F3A0-0000-7000-8000-00000000A001';

describe('PostMediaHandler', () => {
  let execute: jest.Mock;
  let handler: PostMediaHandler;

  beforeEach(() => {
    execute = jest
      .fn()
      .mockResolvedValue(Result.ok({ published: 1, removed: 0 }));
    handler = new PostMediaHandler({
      execute,
    } as unknown as SyncPublicMediaUseCase);
  });

  it('syncs the images of the post', async () => {
    await handler.handle({ blog_image_id: IMAGE, hero_image_id: null });

    expect(execute).toHaveBeenCalledWith({
      media_ids: [IMAGE.toLowerCase()],
    });
  });

  it('does nothing for a post without images', async () => {
    await handler.handle({ blog_image_id: null, hero_image_id: null });

    expect(execute).not.toHaveBeenCalled();
  });
});
