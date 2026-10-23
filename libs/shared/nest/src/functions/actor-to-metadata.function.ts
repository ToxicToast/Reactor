import { Metadata } from '@grpc/grpc-js';
import type { Actor } from '@toxictoast/shared-kernel';
import { ACTOR_METADATA } from '../constants/index.js';

export const actorToMetadata = (actor: Actor): Metadata => {
  const metadata = new Metadata();
  metadata.set(ACTOR_METADATA.TYPE, actor.type);
  if (actor.id) {
    metadata.set(ACTOR_METADATA.ID, actor.id);
  }
  if (actor.ip) {
    metadata.set(ACTOR_METADATA.IP, actor.ip);
  }
  if (actor.permissions.length > 0) {
    metadata.set(ACTOR_METADATA.PERMISSIONS, actor.permissions.join(','));
  }
  return metadata;
};
