import type { DataSourceOptions } from 'typeorm';

export interface DataSourceConfig {
  readonly schemas: NonNullable<DataSourceOptions['entities']>;
  readonly migrations: NonNullable<DataSourceOptions['migrations']>;
}
