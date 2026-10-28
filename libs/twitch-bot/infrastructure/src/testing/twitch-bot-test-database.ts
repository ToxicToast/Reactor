import { PostgresTestDatabase } from '@toxictoast/shared-persistence/testing';
import { twitchBotMigrations } from '../migrations/index.js';
import { twitchBotSchemas } from '../schemas/index.js';

export class TwitchBotTestDatabase extends PostgresTestDatabase {
  constructor() {
    super({ schemas: twitchBotSchemas, migrations: twitchBotMigrations });
  }
}
