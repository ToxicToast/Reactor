import type { Optional } from '@toxictoast/shared-types';
import type { DataSourceConfig } from '../interfaces/index.js';

export interface PostgresTestDatabaseOptions {
  readonly schemas: DataSourceConfig['schemas'];
  readonly migrations?: Optional<DataSourceConfig['migrations']>;
}
