import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorService,
  type HealthIndicatorResult,
} from '@nestjs/terminus';
import { errorMessage } from '@toxictoast/shared-system';
import { DataSource } from 'typeorm';
import { HEALTH } from '../constants/index.js';

@Injectable()
export class DatabaseHealthIndicator {
  constructor(
    private readonly dataSource: DataSource,
    private readonly health: HealthIndicatorService,
  ) {}

  async isHealthy(
    key: string = HEALTH.DATABASE_KEY,
  ): Promise<HealthIndicatorResult> {
    const indicator = this.health.check(key);
    try {
      await this.dataSource.query('SELECT 1');
      return indicator.up();
    } catch (error) {
      return indicator.down({ message: errorMessage(error) });
    }
  }
}
