import { z } from 'zod';

export const AddTwitchFriendBodySchema = z.object({
  login: z.string().trim().min(1),
});
