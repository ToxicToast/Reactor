import { isIP } from 'node:net';
import { ActorType, isActorType, type Actor } from '@toxictoast/shared-system';
import type { Nullable } from '@toxictoast/shared-types';
import { ACTOR_METADATA } from '../constants/index.js';
import type { GrpcMetadata } from '../interfaces/index.js';

const MAX_ID_LENGTH = 64;

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
  if (id === null || id.length > MAX_ID_LENGTH) {
    return null;
  }
  return id;
};

export const actorFromMetadata = (metadata: GrpcMetadata): Actor => {
  const type = read(metadata, ACTOR_METADATA.TYPE);
  const ip = readIp(metadata);
  if (!isActorType(type)) {
    return { type: ActorType.ANONYMOUS, id: null, ip };
  }

  return { type, id: readId(metadata), ip };
};
