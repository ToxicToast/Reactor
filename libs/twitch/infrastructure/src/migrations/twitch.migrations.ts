import type { MigrationInterface } from 'typeorm';
import { CreateTwitchTables1793291530882 } from './1793291530882-CreateTwitchTables';
import { AddTwitchChatMessages1793294888797 } from './1793294888797-AddTwitchChatMessages';
import { WidenWebhookUrl1794380000000 } from './1794380000000-WidenWebhookUrl';

export const twitchMigrations: Array<new () => MigrationInterface> = [
  CreateTwitchTables1793291530882,
  AddTwitchChatMessages1793294888797,
  WidenWebhookUrl1794380000000,
];
