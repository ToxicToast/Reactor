import { Module, type DynamicModule, type Provider } from '@nestjs/common';
import { collectDefaultMetrics, Registry } from 'prom-client';
import { TOKENS } from '../constants/index.js';
import { MetricsController } from '../controllers/index.js';
import type { MetricsModuleOptions } from '../interfaces/index.js';
import { ConsumerMetrics, OutboxMetrics } from '../metrics/index.js';

@Module({})
export class MetricsModule {
  static forRoot(options: MetricsModuleOptions): DynamicModule {
    const providers: Array<Provider> = [
      {
        provide: TOKENS.METRICS_REGISTRY,
        useFactory: (): Registry => {
          const registry = new Registry();
          collectDefaultMetrics({ register: registry });
          return registry;
        },
      },
    ];
    if (options.outbox) {
      providers.push(OutboxMetrics);
    }
    if (options.consumer) {
      providers.push(ConsumerMetrics);
    }

    return {
      module: MetricsModule,
      global: true,
      controllers: [MetricsController],
      providers,
      exports: [TOKENS.METRICS_REGISTRY],
    };
  }
}
