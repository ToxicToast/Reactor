import { type DomainError, err, ok, type Result } from '@toxictoast/shared-kernel';
import type { ProductVariantId } from '../catalog/ids.js';
import type { Quantity, QuantityError } from '../shared/quantity.js';
import type { StorageLocationId } from '../storage/ids.js';
import type { StockLotId, StockMovementId } from './ids.js';
import type { StockMovement } from './stock-movement.js';

export type StockLotError =
  | DomainError<'stock-lot.empty' | 'stock-lot.empty-withdrawal'>
  | QuantityError;

export interface ReceiveStockLotInput {
  readonly id: StockLotId;
  readonly movementId: StockMovementId;
  readonly variantId: ProductVariantId;
  readonly locationId: StorageLocationId;
  /** Expressed in the product's stock unit. */
  readonly quantity: Quantity;
  readonly receivedAt: Date;
  readonly bestBefore: Date | null;
  readonly returnable: boolean;
}

export interface StockLotChange {
  readonly lot: StockLot;
  readonly movement: StockMovement;
}

/** A batch of one product variant at one storage location, sharing best-before and opening date. */
export class StockLot {
  private constructor(
    readonly id: StockLotId,
    readonly variantId: ProductVariantId,
    readonly locationId: StorageLocationId,
    readonly quantity: Quantity,
    readonly receivedAt: Date,
    readonly bestBefore: Date | null,
    readonly openedAt: Date | null,
    readonly returnable: boolean,
  ) {}

  static receive(input: ReceiveStockLotInput): Result<StockLotChange, StockLotError> {
    if (input.quantity.isZero()) {
      return err({ code: 'stock-lot.empty', message: 'A received lot must not be empty' });
    }
    const lot = new StockLot(
      input.id,
      input.variantId,
      input.locationId,
      input.quantity,
      input.receivedAt,
      input.bestBefore,
      null,
      input.returnable,
    );
    return ok({ lot, movement: lot.movement(input.movementId, 'received', input.quantity, input.receivedAt) });
  }

  withdraw(
    quantity: Quantity,
    { movementId, at }: { movementId: StockMovementId; at: Date },
  ): Result<StockLotChange, StockLotError> {
    if (quantity.isZero()) {
      return err({ code: 'stock-lot.empty-withdrawal', message: 'Nothing to withdraw' });
    }
    const rest = this.quantity.subtract(quantity);
    if (!rest.ok) return rest;

    const lot = new StockLot(
      this.id,
      this.variantId,
      this.locationId,
      rest.value,
      this.receivedAt,
      this.bestBefore,
      this.openedAt,
      this.returnable,
    );
    return ok({ lot, movement: this.movement(movementId, 'withdrawn', quantity, at) });
  }

  isDepleted(): boolean {
    return this.quantity.isZero();
  }

  private movement(
    id: StockMovementId,
    type: StockMovement['type'],
    quantity: Quantity,
    occurredAt: Date,
  ): StockMovement {
    return { id, lotId: this.id, type, quantity, occurredAt };
  }
}
