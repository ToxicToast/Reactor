import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import type { Nullable } from '@toxictoast/shared-kernel';
import { TransactionContext } from '@toxictoast/shared-persistence';
import { DataSource } from 'typeorm';
import { blogMigrations } from '../migrations/index.js';
import { blogSchemas } from '../schemas/index.js';

export class PostgresTestDatabase {
  readonly context = new TransactionContext();
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
      entities: blogSchemas,
      migrations: blogMigrations,
    });
    await this.source.initialize();
    await this.source.runMigrations();
  }

  async truncate(): Promise<void> {
    await this.dataSource.query(
      'TRUNCATE tags, categories, media, posts, post_categories, post_tags, comments, outbox',
    );
  }

  async stop(): Promise<void> {
    await this.source?.destroy();
    await this.container?.stop();
  }
}
