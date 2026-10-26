import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import type { Nullable } from '@toxictoast/shared-types';
import { DataSource } from 'typeorm';
import { auditMigrations } from '../migrations/index.js';
import { auditSchemas } from '../schemas/index.js';

export class PostgresTestDatabase {
  private container: Nullable<StartedPostgreSqlContainer> = null;
  private source: Nullable<DataSource> = null;

  get dataSource(): DataSource {
    if (!this.source) {
      throw new Error('PostgresTestDatabase is not started');
    }
    return this.source;
  }

  async start(): Promise<void> {
    this.container = await new PostgreSqlContainer(
      'postgres:18-alpine',
    ).start();
    this.source = new DataSource({
      type: 'postgres',
      url: this.container.getConnectionUri(),
      entities: auditSchemas,
      migrations: auditMigrations,
    });
    await this.source.initialize();
    await this.source.runMigrations();
  }

  async truncate(): Promise<void> {
    await this.dataSource.query('TRUNCATE audit_events');
  }

  async stop(): Promise<void> {
    await this.source?.destroy();
    await this.container?.stop();
  }
}
