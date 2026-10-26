import type { Ban } from '@toxictoast/contracts-grpc';
import type { IpBanAnemic } from '@toxictoast/security-domain';
import { toIso } from '@toxictoast/shared-grpc';

export class IpBanGrpcMapper {
  toProto(anemic: IpBanAnemic): Ban {
    return {
      id: anemic.id,
      ip: anemic.ip,
      level: anemic.level,
      failed_attempts: anemic.failed_attempts,
      banned_until: anemic.banned_until.toISOString(),
      lifted_at: toIso(anemic.lifted_at),
      lifted_by: anemic.lifted_by ?? undefined,
      created_at: anemic.created_at.toISOString(),
      updated_at: toIso(anemic.updated_at),
    };
  }
}
