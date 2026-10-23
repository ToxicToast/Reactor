import { ActorType } from '@toxictoast/shared-kernel';
import { actorFromToken } from './actor-from-token.function.js';

const SUB = 'a42295ac-be2a-49ea-aeb7-4a6ca8f56af3';

describe('actorFromToken', () => {
  it('maps a user token to an actor with the api roles as permissions', () => {
    const actor = actorFromToken(
      {
        sub: SUB,
        preferred_username: 'toxictoast',
        resource_access: {
          'azkaban-api': { roles: ['blog.post.write', 'blog.comment.write'] },
          account: { roles: ['view-profile'] },
        },
      },
      'azkaban-api',
      '203.0.113.7',
    );

    expect(actor).toEqual({
      type: ActorType.USER,
      id: SUB,
      ip: '203.0.113.7',
      permissions: ['blog.post.write', 'blog.comment.write'],
    });
  });

  it('treats keycloak service accounts as ai', () => {
    const actor = actorFromToken(
      { sub: SUB, preferred_username: 'service-account-idea-factory' },
      'azkaban-api',
      null,
    );

    expect(actor.type).toBe(ActorType.AI);
  });

  it('has no permissions without roles for the api client', () => {
    const actor = actorFromToken({ sub: SUB }, 'azkaban-api', null);

    expect(actor.permissions).toEqual([]);
  });
});
