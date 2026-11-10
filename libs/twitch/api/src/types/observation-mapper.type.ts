import type { PayloadReader } from '@toxictoast/shared-kernel';
import type { ObservationParts } from './observation-parts.type.js';

export type ObservationMapper = (payload: PayloadReader) => ObservationParts;
