import type { Nullable } from '@toxictoast/shared-types';

export abstract class CorrelationProvider {
  abstract current(): Nullable<string>;
}
