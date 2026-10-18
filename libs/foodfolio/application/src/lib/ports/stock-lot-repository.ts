import type { StockLot, StockLotChange, StockLotId } from '@toxictoast/foodfolio-domain';

export interface StockLotRepository {
  findById(id: StockLotId): Promise<StockLot | null>;
  /** Persists the new lot state and its movement atomically. */
  save(change: StockLotChange): Promise<void>;
}
