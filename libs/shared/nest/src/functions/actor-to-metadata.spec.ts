import { ActorType, type Actor } from '@toxictoast/shared-kernel';
import { actorFromMetadata } from './actor-from-metadata.function.js';
import { actorToMetadata } from './actor-to-metadata.function.js';

describe('actorToMetadata', () => {
  it('writes an actor that actorFromMetadata reads back', () => {
    const actor: Actor = {
      type: ActorType.SYSTEM,
      id: '0192f3a0-0000-7000-8000-0000000000c0',
      ip: '10.0.0.5',
      permissions: ['blog.media.delete', 'blog.post.write'],
    };

    expect(actorFromMetadata(actorToMetadata(actor))).toEqual(actor);
  });

  it('leaves out empty fields', () => {
    const metadata = actorToMetadata({
      type: ActorType.SYSTEM,
      id: null,
      ip: null,
      permissions: [],
    });

    expect(metadata.get('x-actor-id')).toEqual([]);
    expect(metadata.get('x-actor-ip')).toEqual([]);
    expect(metadata.get('x-actor-permissions')).toEqual([]);
  });
});
