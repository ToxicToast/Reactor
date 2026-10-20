import { Controller } from '@nestjs/common';
import {
  ArchivePostUseCase,
  CreatePostUseCase,
  DeletePostUseCase,
  GetPostUseCase,
  GetPublishedPostUseCase,
  ListPostsUseCase,
  PublishPostUseCase,
  RestorePostUseCase,
  UnarchivePostUseCase,
  UpdatePostUseCase,
} from '@toxictoast/blog-application';
import {
  PostServiceControllerMethods,
  type ArchivePostRequest,
  type ArchivePostResponse,
  type CreatePostRequest,
  type CreatePostResponse,
  type DeletePostRequest,
  type DeletePostResponse,
  type GetPostRequest,
  type GetPostResponse,
  type GetPublishedPostRequest,
  type GetPublishedPostResponse,
  type ListPostsRequest,
  type ListPostsResponse,
  type PostServiceController,
  type PublishPostRequest,
  type PublishPostResponse,
  type RestorePostRequest,
  type RestorePostResponse,
  type UnarchivePostRequest,
  type UnarchivePostResponse,
  type UpdatePostRequest,
  type UpdatePostResponse,
} from '@toxictoast/contracts-grpc';
import {
  mapOptionalEnum,
  parseDate,
  parseId,
  parseOptionalId,
  unwrap,
} from '@toxictoast/shared-grpc';
import { PostGrpcMapper, PostUpdateGrpcMapper } from '../mappers/index.js';
import { POST_STATUS_FROM_GRPC } from '../mappings/index.js';

@Controller()
@PostServiceControllerMethods()
export class PostGrpcController implements PostServiceController {
  private readonly mapper = new PostGrpcMapper();
  private readonly updateMapper = new PostUpdateGrpcMapper();

  constructor(
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly updatePostUseCase: UpdatePostUseCase,
    private readonly publishPostUseCase: PublishPostUseCase,
    private readonly archivePostUseCase: ArchivePostUseCase,
    private readonly unarchivePostUseCase: UnarchivePostUseCase,
    private readonly deletePostUseCase: DeletePostUseCase,
    private readonly restorePostUseCase: RestorePostUseCase,
    private readonly getPostUseCase: GetPostUseCase,
    private readonly getPublishedPostUseCase: GetPublishedPostUseCase,
    private readonly listPostsUseCase: ListPostsUseCase,
  ) {}

  async createPost(request: CreatePostRequest): Promise<CreatePostResponse> {
    const post = unwrap(
      await this.createPostUseCase.execute({
        author_id: parseId(request.author_id, 'author_id'),
        title: request.title,
        excerpt: request.excerpt ?? null,
        content: request.content,
        featured: request.featured,
        category_ids: request.category_ids.map((id) => {
          return parseId(id, 'category_ids');
        }),
        tag_ids: request.tag_ids.map((id) => parseId(id, 'tag_ids')),
        blog_image_id: parseOptionalId(request.blog_image_id, 'blog_image_id'),
        hero_image_id: parseOptionalId(request.hero_image_id, 'hero_image_id'),
      }),
    );
    return { post: this.mapper.toProto(post) };
  }

  async updatePost(request: UpdatePostRequest): Promise<UpdatePostResponse> {
    const post = unwrap(
      await this.updatePostUseCase.execute(this.updateMapper.toInput(request)),
    );
    return { post: this.mapper.toProto(post) };
  }

  async publishPost(request: PublishPostRequest): Promise<PublishPostResponse> {
    const post = unwrap(
      await this.publishPostUseCase.execute({
        id: parseId(request.id),
        published_at: parseDate(request.published_at, 'published_at'),
      }),
    );
    return { post: this.mapper.toProto(post) };
  }

  async archivePost(request: ArchivePostRequest): Promise<ArchivePostResponse> {
    const post = unwrap(
      await this.archivePostUseCase.execute({ id: parseId(request.id) }),
    );
    return { post: this.mapper.toProto(post) };
  }

  async unarchivePost(
    request: UnarchivePostRequest,
  ): Promise<UnarchivePostResponse> {
    const post = unwrap(
      await this.unarchivePostUseCase.execute({ id: parseId(request.id) }),
    );
    return { post: this.mapper.toProto(post) };
  }

  async deletePost(request: DeletePostRequest): Promise<DeletePostResponse> {
    const post = unwrap(
      await this.deletePostUseCase.execute({ id: parseId(request.id) }),
    );
    return { post: this.mapper.toProto(post) };
  }

  async restorePost(request: RestorePostRequest): Promise<RestorePostResponse> {
    const post = unwrap(
      await this.restorePostUseCase.execute({ id: parseId(request.id) }),
    );
    return { post: this.mapper.toProto(post) };
  }

  async getPost(request: GetPostRequest): Promise<GetPostResponse> {
    const post = unwrap(
      await this.getPostUseCase.execute({
        id: parseId(request.id),
        withDeleted: request.with_deleted,
      }),
    );
    return { post: this.mapper.toProto(post) };
  }

  async getPublishedPost(
    request: GetPublishedPostRequest,
  ): Promise<GetPublishedPostResponse> {
    const post = unwrap(
      await this.getPublishedPostUseCase.execute({ slug: request.slug }),
    );
    return { post: this.mapper.toProto(post) };
  }

  async listPosts(request: ListPostsRequest): Promise<ListPostsResponse> {
    const posts = unwrap(
      await this.listPostsUseCase.execute({
        status: mapOptionalEnum(
          POST_STATUS_FROM_GRPC,
          request.status,
          'status',
        ),
        category_id:
          parseOptionalId(request.category_id, 'category_id') ?? undefined,
        tag_id: parseOptionalId(request.tag_id, 'tag_id') ?? undefined,
        limit: request.limit,
        offset: request.offset,
      }),
    );
    return { posts: posts.map((post) => this.mapper.toProto(post)) };
  }
}
