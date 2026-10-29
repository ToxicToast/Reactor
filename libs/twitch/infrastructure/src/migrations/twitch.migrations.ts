import type { MigrationInterface } from 'typeorm';
import { CreateTwitchTables1793291530882 } from './1793291530882-CreateTwitchTables';

export const twitchMigrations: Array<new () => MigrationInterface> = [
  CreateTwitchTables1793291530882,
];
