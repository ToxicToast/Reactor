import type { Nullable } from '@toxictoast/shared-types';
import type { ActorType } from '../enums/index.js';

export interface ActorIdentity {
  readonly type: ActorType;
  readonly id: Nullable<string>;
  readonly ip: Nullable<string>;
}
