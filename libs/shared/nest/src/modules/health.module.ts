import { Module, type DynamicModule, type Provider } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from '../controllers/index.js';
import {
  ConsumerHealthIndicator,
  DatabaseHealthIndicator,
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

    return {
      module: HealthModule,
      imports: [TerminusModule],
      controllers: [HealthController],
      providers,
    };
  }
}
