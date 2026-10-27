import { Inject, Injectable } from '@nestjs/common';
import {
  HealthIndicatorService,
  type HealthIndicatorFunction,
} from '@nestjs/terminus';
import { TOKENS } from '../constants/index.js';
import type { ReadinessProbe } from '../interfaces/index.js';

@Injectable()
export class ProbeHealthIndicator {
  constructor(
    @Inject(TOKENS.READINESS_PROBES)
    private readonly probes: ReadonlyArray<ReadinessProbe>,
    private readonly health: HealthIndicatorService,
  ) {}

  checks(): Array<HealthIndicatorFunction> {
    return this.probes.map((probe) => {
      return async () => {
        const indicator = this.health.check(probe.key);
        try {
          const result = await probe.probe();
          if (result.up) {
            return indicator.up(result.details);
          }
          return indicator.down(result.details);
        } catch (error: unknown) {
          return indicator.down({
            message: error instanceof Error ? error.message : String(error),
          });
        }
      };
    });
  }
}
