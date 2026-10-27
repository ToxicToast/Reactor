import { Module, type DynamicModule, type Provider } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TOKENS } from '../constants/index.js';
import { HealthController } from '../controllers/index.js';
import {
  ConsumerHealthIndicator,
  DatabaseHealthIndicator,
  ProbeHealthIndicator,
} from '../indicators/index.js';
import type { HealthModuleOptions } from '../interfaces/index.js';

@Module({})
export class HealthModule {
  static forRoot(options: HealthModuleOptions): DynamicModule {
    const providers: Array<Provider> = [];
    if (options.database) {
      providers.push(DatabaseHealthIndicator);
    }
    if (options.replay) {
      providers.push(ConsumerHealthIndicator);
    }
    if (options.probes) {
      providers.push(
        {
          provide: TOKENS.READINESS_PROBES,
          inject: options.probes.inject,
          useFactory: options.probes.useFactory,
        },
        ProbeHealthIndicator,
      );
    }

    return {
      module: HealthModule,
      imports: [TerminusModule, ...(options.probes?.imports ?? [])],
      controllers: [HealthController],
      providers,
    };
  }
}
