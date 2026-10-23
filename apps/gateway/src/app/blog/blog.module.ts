import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { BLOG_PACKAGE, BLOG_PROTO_FILES } from '@toxictoast/contracts-proto';
import { createGrpcClientOptions, provideClass } from '@toxictoast/shared-nest';
import { requiredEnv } from '@toxictoast/shared-system';
import { GrpcModule } from '../grpc/grpc.module.js';
import { ActorMetadata } from '../grpc/services/index.js';
import { CategoryController } from './categories/category.controller.js';
import { CategoryGateway } from './categories/category.gateway.js';
import { BLOG_GRPC_CLIENT } from './constants/index.js';
import { TagController } from './tags/tag.controller.js';
import { TagGateway } from './tags/tag.gateway.js';

@Module({
  imports: [
    GrpcModule,
    ClientsModule.registerAsync([
      {
        name: BLOG_GRPC_CLIENT,
        useFactory: () => {
          return createGrpcClientOptions({
            package: BLOG_PACKAGE,
            protoPath: BLOG_PROTO_FILES,
            url: requiredEnv('BLOG_GRPC_URL'),
          });
        },
      },
    ]),
  ],
  controllers: [TagController, CategoryController],
  providers: [
    provideClass(TagGateway, [BLOG_GRPC_CLIENT, ActorMetadata]),
    provideClass(CategoryGateway, [BLOG_GRPC_CLIENT, ActorMetadata]),
  ],
})
export class BlogModule {}
