import type { Anemic } from '@toxictoast/shared-kernel';
import type { ObjectLiteral } from 'typeorm';

export interface Mapper<TAnemic extends Anemic, TRow extends ObjectLiteral> {
  toAnemic(row: TRow): TAnemic;
  toRow(anemic: TAnemic): TRow;
}
