import { ActorType } from '@toxictoast/shared-kernel';
import type { KeycloakConfig } from '../interfaces/index.js';
import { actorFromToken } from './actor-from-token.function.js';

const SUB = 'a42295ac-be2a-49ea-aeb7-4a6ca8f56af3';

const CONFIG: KeycloakConfig = {
  issuer: 'http://localhost:8180/realms/azkaban',
  audience: 'azkaban-api',
  agentClientPrefix: 'azkaban-agent-',
};

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
      CONFIG,
      '203.0.113.7',
    );

    expect(actor).toEqual({
      type: ActorType.USER,
      id: SUB,
      ip: '203.0.113.7',
      permissions: ['blog.post.write', 'blog.comment.write'],
    });
  });

  it('treats service accounts of agent clients as ai', () => {
    const actor = actorFromToken(
      {
        sub: SUB,
        azp: 'azkaban-agent-writer',
        preferred_username: 'service-account-azkaban-agent-writer',
      },
      CONFIG,
      null,
    );

    expect(actor.type).toBe(ActorType.AI);
  });

  it('treats other service accounts as system', () => {
    const actor = actorFromToken(
      {
        sub: SUB,
        azp: 'azkaban-twitch',
        preferred_username: 'service-account-azkaban-twitch',
      },
      CONFIG,
      null,
    );

    expect(actor.type).toBe(ActorType.SYSTEM);
  });

  it('falls back to the username when azp is missing', () => {
    const actor = actorFromToken(
      { sub: SUB, preferred_username: 'service-account-azkaban-agent-writer' },
      CONFIG,
      null,
    );

    expect(actor.type).toBe(ActorType.AI);
  });

  it('has no permissions without roles for the api client', () => {
    const actor = actorFromToken({ sub: SUB }, CONFIG, null);

    expect(actor.permissions).toEqual([]);
  });
});
