import type { ObservationKinds } from '../constants/index.js';

export type ObservationKindValue =
  (typeof ObservationKinds)[keyof typeof ObservationKinds];
