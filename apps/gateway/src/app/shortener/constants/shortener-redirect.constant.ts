import { HttpStatus } from '@nestjs/common';
import { TIME_S } from '@toxictoast/shared-types';

export const SHORTENER_REDIRECT = {
  STATUS: HttpStatus.MOVED_PERMANENTLY,
  /** begrenzt den Browser-Cache der 301, damit Klicks und Zieländerungen nicht ewig hängen */
  CACHE_CONTROL: `public, max-age=${TIME_S.DAY}`,
  /** Express beantwortet HEAD über die GET-Route; Link-Vorschauen und curl -I zählen so nicht als Klick */
  COUNTED_METHOD: 'GET',
} as const;
