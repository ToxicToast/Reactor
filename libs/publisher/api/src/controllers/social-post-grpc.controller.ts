import { Controller } from '@nestjs/common';
import {
  PublisherPermission,
  SocialPostServiceControllerMethods,
  type ListDuePostsResponse,
  type SocialPostServiceController,
} from '@toxictoast/contracts-grpc';
import { ListDuePostsUseCase } from '@toxictoast/publisher-application';
import { requirePermission, unwrap } from '@toxictoast/shared-grpc';
import { ActorProvider } from '@toxictoast/shared-kernel';
import { DuePostGrpcMapper } from '../mappers/index.js';

@Controller()
@SocialPostServiceControllerMethods()
export class SocialPostGrpcController implements SocialPostServiceController {
  private readonly mapper = new DuePostGrpcMapper();

  constructor(
    private readonly listDuePostsUseCase: ListDuePostsUseCase,
    private readonly actors: ActorProvider,
  ) {}

  async listDuePosts(): Promise<ListDuePostsResponse> {
    requirePermission(this.actors.current(), PublisherPermission.SYNC);
    const due = unwrap(await this.listDuePostsUseCase.execute());
    return { posts: due.map((post) => this.mapper.toProto(post)) };
  }
}
