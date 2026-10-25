import type { Nullable } from '@toxictoast/shared-types';

export interface AccessDeniedPayloadV1 {
  readonly ip: string;
  readonly status_code: number;
  readonly method: string;
  readonly path: string;
  readonly user_agent: Nullable<string>;
}
