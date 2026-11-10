import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { LeaderboardEntrySchema } from './leaderboard-entry.schema.js';

export class LeaderboardResponseDto extends createZodDto(
  z.object({ entries: z.array(LeaderboardEntrySchema) }),
) {}
