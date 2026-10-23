import type { Nullable, Optional } from '@toxictoast/shared-types';

export interface ChatCompletionResponse {
  readonly choices?: Optional<
    ReadonlyArray<{
      readonly finish_reason?: Optional<Nullable<string>>;
      readonly message?: Optional<{
        readonly content?: Optional<Nullable<string>>;
      }>;
    }>
  >;
}
