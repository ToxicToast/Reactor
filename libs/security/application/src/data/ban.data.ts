import type { IpBanAnemic } from '@toxictoast/security-domain';
import type { Nullable, Optional } from '@toxictoast/shared-types';

export interface RecordAccessDeniedInput {
  readonly ip: string;
}

export interface RecordAccessDeniedOutput {
  readonly failed_attempts: number;
  readonly ban: Nullable<IpBanAnemic>;
}

export interface UnbanIpInput {
  readonly ip: string;
  readonly lifted_by: Nullable<string>;
}

export interface ListBansInput {
  readonly active_only: boolean;
  readonly limit?: Optional<number>;
  readonly offset?: Optional<number>;
}
