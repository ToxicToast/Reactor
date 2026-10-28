import { PostgresTestDatabase } from '@toxictoast/shared-persistence/testing';
import { twitchSchemas } from '../schemas/index.js';

export class TwitchTestDatabase extends PostgresTestDatabase {
  constructor() {
    super({ schemas: twitchSchemas });
  }
}
