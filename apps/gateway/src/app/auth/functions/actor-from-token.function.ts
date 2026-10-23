import { ActorType, type Actor } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import type { JWTPayload } from 'jose';

const SERVICE_ACCOUNT_PREFIX = 'service-account-';

const rolesOf = (
  payload: JWTPayload,
  client: string,
): ReadonlyArray<string> => {
  const access = payload['resource_access'];
  if (typeof access !== 'object' || access === null) {
    return [];
  }

  const roles = (access as Record<string, { roles?: unknown }>)[client]?.roles;
  if (!Array.isArray(roles)) {
    return [];
  }
  return roles.filter((role): role is string => typeof role === 'string');
};

const typeOf = (payload: JWTPayload): ActorType => {
  const username = payload['preferred_username'];
  if (
    typeof username === 'string' &&
    username.startsWith(SERVICE_ACCOUNT_PREFIX)
  ) {
    return ActorType.AI;
  }
  return ActorType.USER;
};

export const actorFromToken = (
  payload: JWTPayload,
  client: string,
  ip: Nullable<string>,
): Actor => {
  return {
    type: typeOf(payload),
    id: payload.sub ?? null,
    ip,
    permissions: rolesOf(payload, client),
  };
};
