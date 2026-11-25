import { Controller } from '@nestjs/common';
import {
  LinkServiceControllerMethods,
  ShortenerPermission,
  type CreateLinkRequest,
  type CreateLinkResponse,
  type DeleteLinkRequest,
  type DeleteLinkResponse,
  type GetLinkRequest,
  type GetLinkResponse,
  type GetLinkStatsRequest,
  type GetLinkStatsResponse,
  type LinkServiceController,
  type ListLinksRequest,
  type ListLinksResponse,
  type ResolveLinkRequest,
  type ResolveLinkResponse,
  type RestoreLinkRequest,
  type RestoreLinkResponse,
  type UpdateLinkRequest,
  type UpdateLinkResponse,
} from '@toxictoast/contracts-grpc';
import {
  hasPermission,
  parseDate,
  parseId,
  requirePermission,
  unwrap,
} from '@toxictoast/shared-grpc';
import { ActorProvider } from '@toxictoast/shared-kernel';
import {
  CreateLinkUseCase,
  DeleteLinkUseCase,
  GetLinkStatsUseCase,
  GetLinkUseCase,
  ListLinksUseCase,
  ResolveLinkUseCase,
  RestoreLinkUseCase,
  UpdateLinkUseCase,
} from '@toxictoast/shortener-application';
import { LinkGrpcMapper, LinkStatsGrpcMapper } from '../mappers/index.js';

@Controller()
@LinkServiceControllerMethods()
export class LinkGrpcController implements LinkServiceController {
  private readonly mapper = new LinkGrpcMapper();
  private readonly statsMapper = new LinkStatsGrpcMapper();

  constructor(
    private readonly createLinkUseCase: CreateLinkUseCase,
    private readonly updateLinkUseCase: UpdateLinkUseCase,
    private readonly deleteLinkUseCase: DeleteLinkUseCase,
    private readonly restoreLinkUseCase: RestoreLinkUseCase,
    private readonly getLinkUseCase: GetLinkUseCase,
    private readonly listLinksUseCase: ListLinksUseCase,
    private readonly resolveLinkUseCase: ResolveLinkUseCase,
    private readonly getLinkStatsUseCase: GetLinkStatsUseCase,
    private readonly actors: ActorProvider,
  ) {}

  async createLink(request: CreateLinkRequest): Promise<CreateLinkResponse> {
    requirePermission(this.actors.current(), ShortenerPermission.LINK_WRITE);
    const link = unwrap(
      await this.createLinkUseCase.execute({
        target_url: request.target_url,
        description: request.description ?? null,
      }),
    );
    return { link: this.mapper.toProto(link) };
  }

  async updateLink(request: UpdateLinkRequest): Promise<UpdateLinkResponse> {
    requirePermission(this.actors.current(), ShortenerPermission.LINK_WRITE);
    const link = unwrap(
      await this.updateLinkUseCase.execute({
        id: parseId(request.id),
        target_url: request.target_url,
        description: request.description ?? null,
        active: request.active,
      }),
    );
    return { link: this.mapper.toProto(link) };
  }

  async deleteLink(request: DeleteLinkRequest): Promise<DeleteLinkResponse> {
    requirePermission(this.actors.current(), ShortenerPermission.LINK_DELETE);
    const link = unwrap(
      await this.deleteLinkUseCase.execute({ id: parseId(request.id) }),
    );
    return { link: this.mapper.toProto(link) };
  }

  async restoreLink(request: RestoreLinkRequest): Promise<RestoreLinkResponse> {
    requirePermission(this.actors.current(), ShortenerPermission.LINK_DELETE);
    const link = unwrap(
      await this.restoreLinkUseCase.execute({ id: parseId(request.id) }),
    );
    return { link: this.mapper.toProto(link) };
  }

  async getLink(request: GetLinkRequest): Promise<GetLinkResponse> {
    requirePermission(this.actors.current(), ShortenerPermission.LINK_WRITE);
    const link = unwrap(
      await this.getLinkUseCase.execute({
        id: parseId(request.id),
        withDeleted: this.withDeleted(request.with_deleted),
      }),
    );
    return { link: this.mapper.toProto(link) };
  }

  async listLinks(request: ListLinksRequest): Promise<ListLinksResponse> {
    requirePermission(this.actors.current(), ShortenerPermission.LINK_WRITE);
    const links = unwrap(
      await this.listLinksUseCase.execute({
        limit: request.limit,
        offset: request.offset,
        withDeleted: this.withDeleted(request.with_deleted),
      }),
    );
    return { links: links.map((link) => this.mapper.toProto(link)) };
  }

  async resolveLink(request: ResolveLinkRequest): Promise<ResolveLinkResponse> {
    return unwrap(
      await this.resolveLinkUseCase.execute({ id: parseId(request.id) }),
    );
  }

  async getLinkStats(
    request: GetLinkStatsRequest,
  ): Promise<GetLinkStatsResponse> {
    requirePermission(this.actors.current(), ShortenerPermission.LINK_WRITE);
    const stats = unwrap(
      await this.getLinkStatsUseCase.execute({
        id: parseId(request.id),
        from: parseDate(request.from, 'from'),
        to: parseDate(request.to, 'to'),
      }),
    );
    return { stats: this.statsMapper.toProto(stats) };
  }

  private withDeleted(requested: boolean): boolean {
    return (
      requested &&
      hasPermission(this.actors.current(), ShortenerPermission.LINK_DELETE)
    );
  }
}
