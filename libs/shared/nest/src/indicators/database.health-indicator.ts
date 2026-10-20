import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorService,
  type HealthIndicatorResult,
} from '@nestjs/terminus';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseHealthIndicator {
  constructor(
    private readonly dataSource: DataSource,
    private readonly health: HealthIndicatorService,
  ) {}

  async isHealthy(key = 'database'): Promise<HealthIndicatorResult> {
    const indicator = this.health.check(key);
    try {
      await this.dataSource.query('SELECT 1');
      return indicator.up();
    } catch (error) {
      if (error instanceof Error) {
        return indicator.down({ message: error.message });
      }
      return indicator.down({ message: String(error) });
    }
  }
}
