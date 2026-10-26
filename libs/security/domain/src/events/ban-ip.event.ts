import type { DomainEvent } from '@toxictoast/shared-kernel';
import type { IpBanAnemic } from '../anemics/index.js';

export class BanIpEvent implements DomainEvent<IpBanAnemic> {
  readonly event_namespace = 'security.ip';
  readonly event_name = 'banned';
  readonly event_version = 1;

  constructor(
    readonly event_id: string,
    readonly aggregate_id: string,
    readonly occurred_at: Date,
    readonly payload: IpBanAnemic,
  ) {}
}
