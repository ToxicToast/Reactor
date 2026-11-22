import { isIP } from 'node:net';
import { ActorType, isActorType, type Actor } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import type { GrpcMetadata } from '../interfaces/index.js';
import { ACTOR_METADATA, ACTOR_METADATA_LIMITS } from '../constants/index.js';

const read = (metadata: GrpcMetadata, key: string): Nullable<string> => {
  const value = metadata.get(key)[0];
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }
  return trimmed;
};

const readIp = (metadata: GrpcMetadata): Nullable<string> => {
  const ip = read(metadata, ACTOR_METADATA.IP);
  if (ip === null || isIP(ip) === 0) {
    return null;
  }
  return ip;
};

const readId = (metadata: GrpcMetadata): Nullable<string> => {
  const id = read(metadata, ACTOR_METADATA.ID);
  if (id === null || id.length > ACTOR_METADATA_LIMITS.ID_LENGTH) {
    return null;
  }
  return id;
};

const readPermissions = (metadata: GrpcMetadata): ReadonlyArray<string> => {
  const raw = read(metadata, ACTOR_METADATA.PERMISSIONS);
  if (raw === null) {
    return [];
  }

  const permissions = raw
    .split(',')
    .map((permission) => permission.trim())
    .filter((permission) => {
      return (
        permission.length > 0 &&
        permission.length <= ACTOR_METADATA_LIMITS.PERMISSION_LENGTH
      );
    });
  return [...new Set(permissions)];
};

export const actorFromMetadata = (metadata: GrpcMetadata): Actor => {
  const type = read(metadata, ACTOR_METADATA.TYPE);
  const ip = readIp(metadata);
  if (!isActorType(type) || type === ActorType.ANONYMOUS) {
    return { type: ActorType.ANONYMOUS, id: null, ip, permissions: [] };
  }

  return {
    type,
    id: readId(metadata),
    ip,
    permissions: readPermissions(metadata),
  };
};
