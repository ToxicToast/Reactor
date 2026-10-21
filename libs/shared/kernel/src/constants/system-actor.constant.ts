import { ActorType } from '../enums/index.js';
import type { Actor } from '../interfaces/index.js';

export const SYSTEM_ACTOR: Actor = Object.freeze({
  type: ActorType.SYSTEM,
  id: null,
  ip: null,
  permissions: Object.freeze([]),
});
