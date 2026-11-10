import { z } from 'zod';

export const RewardStatSchema = z.object({
  reward_id: z.string(),
  title: z.string(),
  cost: z.number().int(),
  redemptions: z.number().int(),
  points_spent: z.number().int(),
});
