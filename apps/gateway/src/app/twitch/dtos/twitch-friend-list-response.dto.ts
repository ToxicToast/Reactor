import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { TwitchFriendSchema } from './twitch-friend.schema.js';

export class TwitchFriendListResponseDto extends createZodDto(
  z.object({ friends: z.array(TwitchFriendSchema) }),
) {}
