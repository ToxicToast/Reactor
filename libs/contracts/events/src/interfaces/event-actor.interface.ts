import type { Nullable } from '@toxictoast/shared-types';
import type { EventActorTypes } from '../constants/index.js';

export interface EventActorV1 {
  readonly type: (typeof EventActorTypes)[keyof typeof EventActorTypes];
  readonly id: Nullable<string>;
  readonly ip: Nullable<string>;
}
