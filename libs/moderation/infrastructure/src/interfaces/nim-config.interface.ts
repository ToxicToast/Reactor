import type { Nullable } from '@toxictoast/shared-types';

export interface NimConfig {
  readonly baseUrl: string;
  readonly apiKey: Nullable<string>;
  readonly model: string;
  readonly timeoutMs: number;
  readonly maxTokens: number;
  readonly thinking: boolean;
}
