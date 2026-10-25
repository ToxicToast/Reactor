import type { Nullable } from '@toxictoast/shared-types';

export interface IpBanPayloadV1 {
  readonly id: string;
  readonly ip: string;
  readonly level: number;
  readonly failed_attempts: number;
  readonly banned_until: string;
  readonly lifted_at: Nullable<string>;
  readonly lifted_by: Nullable<string>;
  readonly created_at: string;
  readonly updated_at: Nullable<string>;
  readonly deleted_at: Nullable<string>;
}
