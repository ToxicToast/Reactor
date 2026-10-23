import { ModerationStatus } from '@toxictoast/contracts-grpc';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class ModerateCommentDto extends createZodDto(
  z.object({
    status: z.enum([
      ModerationStatus.MODERATION_STATUS_APPROVED,
      ModerationStatus.MODERATION_STATUS_SPAM,
      ModerationStatus.MODERATION_STATUS_HATE,
    ]),
    note: z.string().trim().max(500).optional(),
  }),
) {}
