import type { Optional } from '@toxictoast/shared-types';

export interface RedisConnection {
  readonly host: string;
  readonly port: number;
  readonly password: Optional<string>;
  readonly db: number;
}
