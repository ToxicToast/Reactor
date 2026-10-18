import { type DomainError, err, ok, type Result } from '@toxictoast/shared-kernel';
import { UNITS, type Unit } from './unit.js';

export type QuantityError = DomainError<
  'quantity.invalid' | 'quantity.incompatible-unit' | 'quantity.insufficient'
>;

export class Quantity {
  private constructor(
    readonly amount: number,
    readonly unit: Unit,
  ) {}

  static of(amount: number, unit: Unit): Result<Quantity, QuantityError> {
    if (!Number.isFinite(amount) || amount < 0) {
      return err({
        code: 'quantity.invalid',
        message: `Amount must be a finite number >= 0, got ${amount}`,
      });
    }
    return ok(new Quantity(amount, unit));
  }

  convertTo(unit: Unit): Result<Quantity, QuantityError> {
    const from = UNITS[this.unit];
    const to = UNITS[unit];
    if (from.dimension !== to.dimension) {
      return err({
        code: 'quantity.incompatible-unit',
        message: `Cannot convert ${this.unit} to ${unit}`,
      });
    }
    return ok(new Quantity((this.amount * from.factor) / to.factor, unit));
  }

  add(other: Quantity): Result<Quantity, QuantityError> {
    const aligned = this.align(other);
    if (!aligned.ok) return aligned;
    return ok(new Quantity(this.amount + aligned.value.amount, this.unit));
  }

  subtract(other: Quantity): Result<Quantity, QuantityError> {
    const aligned = this.align(other);
    if (!aligned.ok) return aligned;
    if (aligned.value.amount > this.amount) {
      return err({
        code: 'quantity.insufficient',
        message: `Cannot take ${other.amount} ${other.unit} from ${this.amount} ${this.unit}`,
      });
    }
    return ok(new Quantity(this.amount - aligned.value.amount, this.unit));
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  /**
   * Expresses `other` in this quantity's unit so both can be combined.
   * Policy for mixed units of the same dimension (e.g. 500 g + 1 kg) is decided here.
   */
  private align(other: Quantity): Result<Quantity, QuantityError> {
    if (other.unit === this.unit) return ok(other);

    // TODO(you): same dimension, different unit (g vs kg, ml vs l).
    // Either convert via `other.convertTo(this.unit)`, or reject with 'quantity.incompatible-unit'.
    return err({
      code: 'quantity.incompatible-unit',
      message: `Cannot combine ${this.unit} with ${other.unit}`,
    });
  }
}
