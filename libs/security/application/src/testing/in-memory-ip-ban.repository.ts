import type {
  IpBanAnemic,
  IpBanId,
  IpBanRepository,
} from '@toxictoast/security-domain';
import type { Nullable, Optional } from '@toxictoast/shared-types';

export class InMemoryIpBanRepository implements IpBanRepository {
  readonly items = new Map<IpBanId, IpBanAnemic>();

  async save(anemic: IpBanAnemic): Promise<IpBanAnemic> {
    this.items.set(anemic.id, anemic);
    return anemic;
  }

  async findList(
    limit?: Optional<number>,
    offset = 0,
  ): Promise<Array<IpBanAnemic>> {
    return this.page(this.newestFirst([...this.items.values()]), limit, offset);
  }

  async findById(id: IpBanId): Promise<Nullable<IpBanAnemic>> {
    return this.items.get(id) ?? null;
  }

  async findActiveByIp(ip: string, now: Date): Promise<Nullable<IpBanAnemic>> {
    return (
      [...this.items.values()].find((ban) => {
        return ban.ip === ip && this.isActive(ban, now);
      }) ?? null
    );
  }

  async findActive(
    now: Date,
    limit?: Optional<number>,
    offset = 0,
  ): Promise<Array<IpBanAnemic>> {
    const active = [...this.items.values()].filter((ban) => {
      return this.isActive(ban, now);
    });
    return this.page(this.newestFirst(active), limit, offset);
  }

  async countSince(ip: string, since: Date): Promise<number> {
    return [...this.items.values()].filter((ban) => {
      return ban.ip === ip && ban.created_at >= since;
    }).length;
  }

  private isActive(ban: IpBanAnemic, now: Date): boolean {
    return ban.lifted_at === null && ban.banned_until > now;
  }

  private newestFirst(bans: Array<IpBanAnemic>): Array<IpBanAnemic> {
    return bans.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  private page(
    bans: Array<IpBanAnemic>,
    limit: Optional<number>,
    offset: number,
  ): Array<IpBanAnemic> {
    return bans.slice(offset, limit === undefined ? undefined : offset + limit);
  }
}
