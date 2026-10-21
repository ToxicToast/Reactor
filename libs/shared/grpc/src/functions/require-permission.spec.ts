import { status } from '@grpc/grpc-js';
import type { RpcException } from '@nestjs/microservices';
import { ActorType, SYSTEM_ACTOR, type Actor } from '@toxictoast/shared-kernel';
import { requirePermission } from './require-permission.function.js';

const ID = '0192f3a0-0000-7000-8000-000000000002';
const PERMISSION = 'blog.comment.write';

const actor = (overrides: Partial<Actor> = {}): Actor => {
  return {
    type: ActorType.USER,
    id: ID,
    ip: null,
    permissions: [PERMISSION],
    ...overrides,
  };
};

const codeOf = (call: () => unknown): unknown => {
  try {
    call();
    return 'no error';
  } catch (error) {
    return ((error as RpcException).getError() as { code: number }).code;
  }
};

describe('requirePermission', () => {
  it('returns the lowercased id of an actor with the permission', () => {
    expect(requirePermission(actor({ id: ID.toUpperCase() }), PERMISSION)).toBe(
      ID,
    );
  });

  it('accepts ai actors with the permission', () => {
    expect(requirePermission(actor({ type: ActorType.AI }), PERMISSION)).toBe(
      ID,
    );
  });

  it.each<[string, Actor]>([
    ['anonymous', { ...SYSTEM_ACTOR, type: ActorType.ANONYMOUS }],
    ['system without id', SYSTEM_ACTOR],
    ['invalid id', actor({ id: 'abc' })],
  ])('rejects %s with UNAUTHENTICATED', (_label, subject) => {
    expect(codeOf(() => requirePermission(subject, PERMISSION))).toBe(
      status.UNAUTHENTICATED,
    );
  });

  it('rejects a missing permission with PERMISSION_DENIED', () => {
    expect(
      codeOf(() => requirePermission(actor({ permissions: [] }), PERMISSION)),
    ).toBe(status.PERMISSION_DENIED);
  });
});
