import type { Nullable } from '@toxictoast/shared-types';
import type { IpBanId } from '../types/index.js';

export interface IpBanEventPayload {
  readonly id: IpBanId;
  readonly ip: string;
  readonly level: number;
  readonly failed_attempts: number;
  readonly banned_until: Date;
  readonly lifted_at: Nullable<Date>;
  readonly lifted_by: Nullable<string>;
  readonly created_at: Date;
  readonly updated_at: Nullable<Date>;
  readonly deleted_at: Nullable<Date>;
}
