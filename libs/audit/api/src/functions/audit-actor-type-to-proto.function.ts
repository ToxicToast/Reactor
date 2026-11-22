import { AuditActorType } from '@toxictoast/contracts-grpc';
import { AUDIT_ACTOR_TYPE_TO_PROTO } from '../constants/index.js';

export const auditActorTypeToProto = (value: string): AuditActorType => {
  if (!Object.hasOwn(AUDIT_ACTOR_TYPE_TO_PROTO, value)) {
    return AuditActorType.AUDIT_ACTOR_TYPE_UNKNOWN;
  }
  return AUDIT_ACTOR_TYPE_TO_PROTO[
    value as keyof typeof AUDIT_ACTOR_TYPE_TO_PROTO
  ];
};
