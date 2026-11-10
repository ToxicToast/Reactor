import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import type { Nullable } from '@toxictoast/shared-types';
import { DataSource } from 'typeorm';
import { TransactionContext } from '../classes/index.js';
import type { PostgresTestDatabaseOptions } from './postgres-test-database-options.interface.js';
import { POSTGRES_TEST_IMAGE } from './postgres-test-image.constant.js';

export class PostgresTestDatabase {
  readonly context = new TransactionContext();
  private container: Nullable<StartedPostgreSqlContainer> = null;
  private source: Nullable<DataSource> = null;

  constructor(private readonly options: PostgresTestDatabaseOptions) {}

  get dataSource(): DataSource {
    if (!this.source) {
      throw new Error('PostgresTestDatabase is not started');
    }
    return this.source;
  }

  async start(): Promise<void> {
    const migrations = this.options.migrations;
    this.container = await new PostgreSqlContainer(POSTGRES_TEST_IMAGE).start();
    this.source = new DataSource({
      type: 'postgres',
      url: this.container.getConnectionUri(),
      entities: this.options.schemas,
      migrations: migrations ?? [],
      synchronize: migrations === undefined,
    });
    await this.source.initialize();
    if (migrations !== undefined) {
      await this.source.runMigrations();
    }
  }

  async truncate(): Promise<void> {
    const tables = this.dataSource.entityMetadatas.map((metadata) => {
      return `"${metadata.tableName}"`;
    });
    await this.dataSource.query(`TRUNCATE ${tables.join(', ')}`);
  }

  async stop(): Promise<void> {
    await this.source?.destroy();
    await this.container?.stop();
  }
}
