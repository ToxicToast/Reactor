import { AuditActorType } from '@toxictoast/contracts-grpc';
import { enumNames } from '../../common/functions/index.js';

export const AUDIT_ACTOR_TYPE_QUERY = {
  user: AuditActorType.AUDIT_ACTOR_TYPE_USER,
  ai: AuditActorType.AUDIT_ACTOR_TYPE_AI,
  system: AuditActorType.AUDIT_ACTOR_TYPE_SYSTEM,
  anonymous: AuditActorType.AUDIT_ACTOR_TYPE_ANONYMOUS,
  unknown: AuditActorType.AUDIT_ACTOR_TYPE_UNKNOWN,
} as const;

export const AUDIT_ACTOR_TYPE_NAMES = enumNames(AUDIT_ACTOR_TYPE_QUERY);
