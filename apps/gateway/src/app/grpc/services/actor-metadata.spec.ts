import { ActorType } from '@toxictoast/shared-kernel';
import { ActorContext } from '@toxictoast/shared-system';
import { ActorMetadata } from './actor-metadata.service.js';

describe('ActorMetadata', () => {
  it('builds the metadata from the actor of the current request', () => {
    const actors = new ActorContext();
    const metadata = new ActorMetadata(actors);

    const result = actors.run(
      {
        type: ActorType.USER,
        id: 'a42295ac-be2a-49ea-aeb7-4a6ca8f56af3',
        ip: '203.0.113.7',
        permissions: ['blog.tag.write', 'blog.tag.delete'],
      },
      () => metadata.current(),
    );

    expect(result.get('x-actor-type')).toEqual(['user']);
    expect(result.get('x-actor-id')).toEqual([
      'a42295ac-be2a-49ea-aeb7-4a6ca8f56af3',
    ]);
    expect(result.get('x-actor-permissions')).toEqual([
      'blog.tag.write,blog.tag.delete',
    ]);
  });
});
