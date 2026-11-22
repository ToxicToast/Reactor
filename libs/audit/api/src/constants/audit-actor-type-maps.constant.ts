import { AuditActorType } from '@toxictoast/contracts-grpc';
import { ActorType } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import { UNKNOWN_ACTOR_TYPE } from './unknown-actor-type.constant.js';

export const AUDIT_ACTOR_TYPE_TO_PROTO = {
  [ActorType.USER]: AuditActorType.AUDIT_ACTOR_TYPE_USER,
  [ActorType.AI]: AuditActorType.AUDIT_ACTOR_TYPE_AI,
  [ActorType.SYSTEM]: AuditActorType.AUDIT_ACTOR_TYPE_SYSTEM,
  [ActorType.ANONYMOUS]: AuditActorType.AUDIT_ACTOR_TYPE_ANONYMOUS,
  [UNKNOWN_ACTOR_TYPE]: AuditActorType.AUDIT_ACTOR_TYPE_UNKNOWN,
} as const satisfies Readonly<
  Record<ActorType | typeof UNKNOWN_ACTOR_TYPE, AuditActorType>
>;

export const AUDIT_ACTOR_TYPE_FROM_PROTO = {
  [AuditActorType.AUDIT_ACTOR_TYPE_UNSPECIFIED]: null,
  ...Object.fromEntries(
    Object.entries(AUDIT_ACTOR_TYPE_TO_PROTO).map(([type, proto]) => {
      return [proto, type];
    }),
  ),
} as Readonly<Record<AuditActorType, Nullable<string>>>;
