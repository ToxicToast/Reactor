import type { Anemic } from '@toxictoast/shared-kernel';

export interface SaveRepository<TAnemic extends Anemic> {
  save(anemic: TAnemic): Promise<TAnemic>;
}
