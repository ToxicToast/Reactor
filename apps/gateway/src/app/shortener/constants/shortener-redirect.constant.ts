import { HttpStatus } from '@nestjs/common';
import { TIME_S } from '@toxictoast/shared-types';

export const SHORTENER_REDIRECT = {
  STATUS: HttpStatus.MOVED_PERMANENTLY,
  /** begrenzt den Browser-Cache der 301, damit Klicks und Zieländerungen nicht ewig hängen */
  CACHE_CONTROL: `public, max-age=${TIME_S.DAY}`,
} as const;
