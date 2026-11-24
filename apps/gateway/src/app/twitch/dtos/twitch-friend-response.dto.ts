import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { TwitchFriendSchema } from './twitch-friend.schema.js';

export class TwitchFriendResponseDto extends createZodDto(
  z.object({ friend: TwitchFriendSchema }),
) {}
