import type { Result } from '@toxictoast/shared-kernel';
import { Quantity } from './quantity.js';

const unwrap = <T, E>(result: Result<T, E>): T => {
  if (!result.ok) throw new Error(`expected ok, got ${JSON.stringify(result.error)}`);
  return result.value;
};
const errorCode = <T, E extends { code: string }>(result: Result<T, E>) =>
  result.ok ? undefined : result.error.code;

describe('Quantity', () => {
  describe('of', () => {
    it('accepts zero and positive amounts', () => {
      expect(unwrap(Quantity.of(0, 'g')).amount).toBe(0);
      expect(unwrap(Quantity.of(2.5, 'kg')).amount).toBe(2.5);
    });

    it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])(
      'rejects %s',
      (amount) => {
        expect(errorCode(Quantity.of(amount, 'g'))).toBe('quantity.invalid');
      },
    );
  });

  describe('convertTo', () => {
    it('converts within the same dimension', () => {
      const grams = unwrap(unwrap(Quantity.of(1.5, 'kg')).convertTo('g'));

      expect(grams.amount).toBe(1500);
      expect(grams.unit).toBe('g');
    });

    it('rejects conversion across dimensions', () => {
      const liters = unwrap(Quantity.of(1, 'l'));

      expect(errorCode(liters.convertTo('g'))).toBe('quantity.incompatible-unit');
      expect(errorCode(liters.convertTo('piece'))).toBe('quantity.incompatible-unit');
    });
  });

  describe('add', () => {
    it('adds quantities of the same unit', () => {
      const sum = unwrap(unwrap(Quantity.of(200, 'g')).add(unwrap(Quantity.of(300, 'g'))));

      expect(sum.amount).toBe(500);
      expect(sum.unit).toBe('g');
    });

    it('rejects adding across dimensions', () => {
      const pieces = unwrap(Quantity.of(2, 'piece'));

      expect(errorCode(pieces.add(unwrap(Quantity.of(1, 'l'))))).toBe(
        'quantity.incompatible-unit',
      );
    });

    // TODO(you): decide the policy for 500 g + 1 kg and pin it down here.
    it.todo('handles different units of the same dimension (500 g + 1 kg)');
  });

  describe('subtract', () => {
    it('subtracts down to exactly zero', () => {
      const rest = unwrap(unwrap(Quantity.of(300, 'g')).subtract(unwrap(Quantity.of(300, 'g'))));

      expect(rest.isZero()).toBe(true);
    });

    it('refuses to go below zero: what is gone is gone', () => {
      const stock = unwrap(Quantity.of(300, 'g'));

      expect(errorCode(stock.subtract(unwrap(Quantity.of(500, 'g'))))).toBe(
        'quantity.insufficient',
      );
    });
  });
});
