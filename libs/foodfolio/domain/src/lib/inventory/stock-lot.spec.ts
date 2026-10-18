import type { Result } from '@toxictoast/shared-kernel';
import type { ProductVariantId } from '../catalog/ids.js';
import { Quantity } from '../shared/quantity.js';
import type { Unit } from '../shared/unit.js';
import type { StorageLocationId } from '../storage/ids.js';
import type { StockLotId, StockMovementId } from './ids.js';
import { StockLot } from './stock-lot.js';

const unwrap = <T, E>(result: Result<T, E>): T => {
  if (!result.ok) throw new Error(`expected ok, got ${JSON.stringify(result.error)}`);
  return result.value;
};
const errorCode = <T, E extends { code: string }>(result: Result<T, E>) =>
  result.ok ? undefined : result.error.code;

const qty = (amount: number, unit: Unit = 'g') => unwrap(Quantity.of(amount, unit));
const receivedAt = new Date('2026-10-18T10:00:00Z');

const receive = (quantity = qty(1000)) =>
  StockLot.receive({
    id: 'lot-1' as StockLotId,
    movementId: 'mov-1' as StockMovementId,
    variantId: 'variant-1' as ProductVariantId,
    locationId: 'pantry' as StorageLocationId,
    quantity,
    receivedAt,
    bestBefore: new Date('2027-03-31'),
    returnable: false,
  });

describe('StockLot', () => {
  describe('receive', () => {
    it('creates a lot holding the received quantity', () => {
      const { lot } = unwrap(receive(qty(1000)));

      expect(lot.quantity.amount).toBe(1000);
      expect(lot.locationId).toBe('pantry');
      expect(lot.isDepleted()).toBe(false);
    });

    it('records a "received" movement for the same quantity', () => {
      const { movement } = unwrap(receive(qty(1000)));

      expect(movement).toMatchObject({
        id: 'mov-1',
        lotId: 'lot-1',
        type: 'received',
        occurredAt: receivedAt,
      });
      expect(movement.quantity.amount).toBe(1000);
    });

    it('rejects an empty lot', () => {
      expect(errorCode(receive(qty(0)))).toBe('stock-lot.empty');
    });
  });

  describe('withdraw', () => {
    const takenAt = new Date('2026-10-20T18:00:00Z');

    it('reduces the lot and records a "withdrawn" movement', () => {
      const { lot } = unwrap(receive(qty(1000)));

      const result = unwrap(
        lot.withdraw(qty(300), { movementId: 'mov-2' as StockMovementId, at: takenAt }),
      );

      expect(result.lot.quantity.amount).toBe(700);
      expect(result.movement).toMatchObject({ type: 'withdrawn', occurredAt: takenAt });
      expect(lot.quantity.amount).toBe(1000);
    });

    it('depletes the lot when everything is taken', () => {
      const { lot } = unwrap(receive(qty(1000)));

      const result = unwrap(
        lot.withdraw(qty(1000), { movementId: 'mov-2' as StockMovementId, at: takenAt }),
      );

      expect(result.lot.isDepleted()).toBe(true);
    });

    it('refuses to take more than is there', () => {
      const { lot } = unwrap(receive(qty(1000)));

      const result = lot.withdraw(qty(1500), {
        movementId: 'mov-2' as StockMovementId,
        at: takenAt,
      });

      expect(errorCode(result)).toBe('quantity.insufficient');
    });

    it('refuses an empty withdrawal', () => {
      const { lot } = unwrap(receive(qty(1000)));

      const result = lot.withdraw(qty(0), { movementId: 'mov-2' as StockMovementId, at: takenAt });

      expect(errorCode(result)).toBe('stock-lot.empty-withdrawal');
    });
  });
});
