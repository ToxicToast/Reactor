import type { IpBanAnemic, IpBanId } from '@toxictoast/security-domain';
import type { Mapper } from '@toxictoast/shared-persistence';
import type { IpBanRow } from '../interfaces/index.js';

export class IpBanMapper implements Mapper<IpBanAnemic, IpBanRow> {
  toAnemic(row: IpBanRow): IpBanAnemic {
    return {
      id: row.id as IpBanId,
      ip: row.ip,
      level: row.level,
      failed_attempts: row.failed_attempts,
      banned_until: row.banned_until,
      lifted_at: row.lifted_at,
      lifted_by: row.lifted_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at,
    };
  }

  toRow(anemic: IpBanAnemic): IpBanRow {
    return {
      id: anemic.id,
      ip: anemic.ip,
      level: anemic.level,
      failed_attempts: anemic.failed_attempts,
      banned_until: anemic.banned_until,
      lifted_at: anemic.lifted_at,
      lifted_by: anemic.lifted_by,
      created_at: anemic.created_at,
      updated_at: anemic.updated_at,
      deleted_at: anemic.deleted_at,
    };
  }
}
