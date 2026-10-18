import type { Quantity } from '../shared/quantity.js';
import type { StockLotId, StockMovementId } from './ids.js';

export type StockMovementType = 'received' | 'withdrawn';

/** Immutable fact: the source of truth for stock levels. */
export interface StockMovement {
  readonly id: StockMovementId;
  readonly lotId: StockLotId;
  readonly type: StockMovementType;
  readonly quantity: Quantity;
  readonly occurredAt: Date;
}
