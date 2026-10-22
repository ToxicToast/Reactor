import { Controller, Get, Optional } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  type HealthCheckResult,
  type HealthIndicatorFunction,
} from '@nestjs/terminus';
import { DatabaseHealthIndicator } from '../indicators/index.js';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    @Optional() private readonly database?: DatabaseHealthIndicator,
  ) {}

  @Get('live')
  @HealthCheck()
  live(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }

  @Get('ready')
  @HealthCheck()
  ready(): Promise<HealthCheckResult> {
    const checks: Array<HealthIndicatorFunction> = [];
    if (this.database) {
      const database = this.database;
      checks.push(() => database.isHealthy());
    }
    return this.health.check(checks);
  }
}
