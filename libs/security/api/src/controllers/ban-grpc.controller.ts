import { Controller } from '@nestjs/common';
import {
  BanServiceControllerMethods,
  SecurityPermission,
  type BanServiceController,
  type ListBansRequest,
  type ListBansResponse,
  type UnbanIpRequest,
  type UnbanIpResponse,
} from '@toxictoast/contracts-grpc';
import {
  ListBansUseCase,
  UnbanIpUseCase,
} from '@toxictoast/security-application';
import { requirePermission, unwrap } from '@toxictoast/shared-grpc';
import { ActorProvider } from '@toxictoast/shared-kernel';
import { IpBanGrpcMapper } from '../mappers/index.js';

@Controller()
@BanServiceControllerMethods()
export class BanGrpcController implements BanServiceController {
  private readonly mapper = new IpBanGrpcMapper();

  constructor(
    private readonly listBansUseCase: ListBansUseCase,
    private readonly unbanIpUseCase: UnbanIpUseCase,
    private readonly actors: ActorProvider,
  ) {}

  async listBans(request: ListBansRequest): Promise<ListBansResponse> {
    requirePermission(this.actors.current(), SecurityPermission.BAN_MANAGE);
    const bans = unwrap(
      await this.listBansUseCase.execute({
        active_only: request.active_only,
        limit: request.limit,
        offset: request.offset,
      }),
    );
    return { bans: bans.map((ban) => this.mapper.toProto(ban)) };
  }

  async unbanIp(request: UnbanIpRequest): Promise<UnbanIpResponse> {
    const actorId = requirePermission(
      this.actors.current(),
      SecurityPermission.BAN_MANAGE,
    );
    const ban = unwrap(
      await this.unbanIpUseCase.execute({
        ip: request.ip,
        lifted_by: actorId,
      }),
    );
    return { ban: this.mapper.toProto(ban) };
  }
}
