import type { Nullable } from '@toxictoast/shared-types';
import type { ActorType } from '../enums/index.js';

export interface Actor {
  readonly type: ActorType;
  readonly id: Nullable<string>;
  readonly ip: Nullable<string>;
}
