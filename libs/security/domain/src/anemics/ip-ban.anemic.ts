import type { Anemic } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import type { IpBanId } from '../types/index.js';

export interface IpBanAnemic extends Anemic<IpBanId> {
  readonly ip: string;
  readonly level: number;
  readonly failed_attempts: number;
  readonly banned_until: Date;
  readonly lifted_at: Nullable<Date>;
  readonly lifted_by: Nullable<string>;
}
