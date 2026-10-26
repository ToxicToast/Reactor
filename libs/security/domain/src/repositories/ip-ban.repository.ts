import type { Repository } from '@toxictoast/shared-kernel';
import type { Chainable, Nullable, Optional } from '@toxictoast/shared-types';
import type { IpBanAnemic } from '../anemics/index.js';

interface AdditionalMethods {
  findActiveByIp(ip: string, now: Date): Promise<Nullable<IpBanAnemic>>;
  findActive(
    now: Date,
    limit?: Optional<number>,
    offset?: Optional<number>,
  ): Promise<Array<IpBanAnemic>>;
  countSince(ip: string, since: Date): Promise<number>;
}

export type IpBanRepository = Chainable<
  Repository<IpBanAnemic>,
  AdditionalMethods
>;
