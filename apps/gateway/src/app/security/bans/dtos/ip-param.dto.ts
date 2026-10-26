import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class IpParamDto extends createZodDto(
  z.object({
    ip: z.union([z.ipv4(), z.ipv6()], {
      error: 'must be an ipv4 or ipv6 address',
    }),
  }),
) {}
