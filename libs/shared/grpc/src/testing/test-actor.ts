import { ActorType, type Actor } from '@toxictoast/shared-kernel';

const TEST_ACTOR_ID = '0192f3a0-0000-7000-8000-0000000000ac';

export const testActor = (
  permissions: ReadonlyArray<string> = [],
  overrides: Partial<Actor> = {},
): Actor => {
  return {
    type: ActorType.USER,
    id: TEST_ACTOR_ID,
    ip: null,
    permissions,
    ...overrides,
  };
};
