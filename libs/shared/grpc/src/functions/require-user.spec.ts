import { status } from '@grpc/grpc-js';
import type { RpcException } from '@nestjs/microservices';
import { ActorType, SYSTEM_ACTOR, type Actor } from '@toxictoast/shared-kernel';
import { requireUser } from './require-user.function.js';

const ID = '0192f3a0-0000-7000-8000-000000000002';

const codeOf = (call: () => unknown): unknown => {
  try {
    call();
    return 'no error';
  } catch (error) {
    return ((error as RpcException).getError() as { code: number }).code;
  }
};

describe('requireUser', () => {
  it('returns the lowercased id of a user', () => {
    const actor: Actor = {
      type: ActorType.USER,
      id: ID.toUpperCase(),
      ip: null,
    };

    expect(requireUser(actor)).toBe(ID);
  });

  it.each<[string, Actor]>([
    ['anonymous', { type: ActorType.ANONYMOUS, id: null, ip: null }],
    ['system', SYSTEM_ACTOR],
    ['ai', { type: ActorType.AI, id: ID, ip: null }],
    ['user without id', { type: ActorType.USER, id: null, ip: null }],
    ['user with invalid id', { type: ActorType.USER, id: 'abc', ip: null }],
  ])('rejects %s with UNAUTHENTICATED', (_label, actor) => {
    expect(codeOf(() => requireUser(actor))).toBe(status.UNAUTHENTICATED);
  });
});
