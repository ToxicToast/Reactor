import { Module, type DynamicModule } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { requiredEnv } from '@toxictoast/shared-system';
import { createGrpcClientOptions } from '../functions/index.js';
import type { GrpcClientModuleOptions } from '../interfaces/index.js';

@Module({})
export class GrpcClientModule {
  static register(options: GrpcClientModuleOptions): DynamicModule {
    return {
      module: GrpcClientModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name: options.name,
            useFactory: () => {
              return createGrpcClientOptions({
                package: options.package,
                protoPath: options.protoPath,
                url: requiredEnv(options.urlEnv),
              });
            },
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
