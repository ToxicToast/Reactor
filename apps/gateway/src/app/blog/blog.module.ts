import { Module } from '@nestjs/common';
import { BLOG_GRPC_CLIENT } from '@toxictoast/contracts-grpc';
import { BLOG_PACKAGE, BLOG_PROTO_FILES } from '@toxictoast/contracts-proto';
import { GrpcClientModule, provideClass } from '@toxictoast/shared-nest';
import { GrpcModule } from '../grpc/grpc.module.js';
import { ActorMetadata } from '../grpc/services/index.js';
import { CategoryController } from './categories/category.controller.js';
import { CategoryGateway } from './categories/category.gateway.js';
import { TagController } from './tags/tag.controller.js';
import { TagGateway } from './tags/tag.gateway.js';

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
  controllers: [TagController, CategoryController],
  providers: [
    provideClass(TagGateway, [BLOG_GRPC_CLIENT, ActorMetadata]),
    provideClass(CategoryGateway, [BLOG_GRPC_CLIENT, ActorMetadata]),
  ],
})
export class BlogModule {}
