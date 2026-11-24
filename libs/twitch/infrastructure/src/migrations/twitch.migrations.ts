import type { MigrationInterface } from 'typeorm';
import { CreateTwitchTables1793291530882 } from './1793291530882-CreateTwitchTables';
import { AddTwitchChatMessages1793294888797 } from './1793294888797-AddTwitchChatMessages';
import { WidenWebhookUrl1794380000000 } from './1794380000000-WidenWebhookUrl';
import { AddTwitchFollows1795360227697 } from './1795360227697-AddTwitchFollows';
import { AddTwitchClipsAndVideos1795376488331 } from './1795376488331-AddTwitchClipsAndVideos';
import { AddStreamSessionStatus1795434540766 } from './1795434540766-AddStreamSessionStatus';
import { AddFollowerTotal1795522849277 } from './1795522849277-AddFollowerTotal';

export const twitchMigrations: Array<new () => MigrationInterface> = [
  CreateTwitchTables1793291530882,
  AddTwitchChatMessages1793294888797,
  WidenWebhookUrl1794380000000,
  AddTwitchFollows1795360227697,
  AddTwitchClipsAndVideos1795376488331,
  AddStreamSessionStatus1795434540766,
  AddFollowerTotal1795522849277,
];
