import { ActorType, type Actor } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import type { JWTPayload } from 'jose';
import type { KeycloakConfig } from '../interfaces/index.js';

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

const serviceAccountClientOf = (payload: JWTPayload): Nullable<string> => {
  const username = payload['preferred_username'];
  if (
    typeof username !== 'string' ||
    !username.startsWith(SERVICE_ACCOUNT_PREFIX)
  ) {
    return null;
  }

  const client = payload['azp'];
  if (typeof client === 'string') {
    return client;
  }
  return username.slice(SERVICE_ACCOUNT_PREFIX.length);
};

const typeOf = (payload: JWTPayload, agentClientPrefix: string): ActorType => {
  const client = serviceAccountClientOf(payload);
  if (client === null) {
    return ActorType.USER;
  }
  if (client.startsWith(agentClientPrefix)) {
    return ActorType.AI;
  }
  return ActorType.SYSTEM;
};

export const actorFromToken = (
  payload: JWTPayload,
  config: KeycloakConfig,
  ip: Nullable<string>,
): Actor => {
  return {
    type: typeOf(payload, config.agentClientPrefix),
    id: payload.sub ?? null,
    ip,
    permissions: rolesOf(payload, config.audience),
  };
};
