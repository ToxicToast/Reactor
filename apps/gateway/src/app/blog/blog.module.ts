import { Module } from '@nestjs/common';
import { BLOG_GRPC_CLIENT } from '@toxictoast/contracts-grpc';
import { BLOG_PACKAGE, BLOG_PROTO_FILES } from '@toxictoast/contracts-proto';
import { GrpcClientModule, provideClass } from '@toxictoast/shared-nest';
import { GrpcModule } from '../grpc/grpc.module.js';
import { RequestMetadata } from '../grpc/services/index.js';
import { CategoryController } from './categories/category.controller.js';
import { CategoryGateway } from './categories/category.gateway.js';
import { TagController } from './tags/tag.controller.js';
import { TagGateway } from './tags/tag.gateway.js';
import { CommentController } from './comments/comment.controller.js';
import { CommentGateway } from './comments/comment.gateway.js';
import { PostController } from './posts/post.controller.js';
import { PostGateway } from './posts/post.gateway.js';
import { MediaController } from './media/media.controller.js';
import { MediaGateway } from './media/media.gateway.js';

@Module({
  imports: [
    GrpcModule,
    GrpcClientModule.register({
      name: BLOG_GRPC_CLIENT,
      package: BLOG_PACKAGE,
      protoPath: BLOG_PROTO_FILES,
      urlEnv: 'BLOG_GRPC_URL',
    }),
  ],
  controllers: [
    TagController,
    CategoryController,
    PostController,
    CommentController,
    MediaController,
  ],
  providers: [
    provideClass(TagGateway, [BLOG_GRPC_CLIENT, RequestMetadata]),
    provideClass(CategoryGateway, [BLOG_GRPC_CLIENT, RequestMetadata]),
    provideClass(PostGateway, [BLOG_GRPC_CLIENT, RequestMetadata]),
    provideClass(CommentGateway, [BLOG_GRPC_CLIENT, RequestMetadata]),
    provideClass(MediaGateway, [BLOG_GRPC_CLIENT, RequestMetadata]),
  ],
})
export class BlogModule {}
