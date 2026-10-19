import type { Id, Nullable, Optional } from '../types/index.js';
import type { Anemic } from './anemic.interface.js';

export interface Repository<
  TAnemic extends Anemic,
  TId extends Id<string> = TAnemic['id'],
> {
  save(anemic: TAnemic): Promise<TAnemic>;
  findList(
    limit?: Optional<number>,
    offset?: Optional<number>,
    withDeleted?: Optional<boolean>,
  ): Promise<Array<TAnemic>>;
  findById(
    id: TId,
    withDeleted?: Optional<boolean>,
  ): Promise<Nullable<TAnemic>>;
}
