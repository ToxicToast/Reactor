import {
  ErrorOfSuccessfulResultError,
  ValidationError,
  ValueOfFailedResultError,
} from '../errors/index.js';
import { Result } from './result.class.js';

describe('Result', () => {
  it('carries the value of a success', () => {
    const result = Result.ok(42);

    expect(result.isSuccess).toBe(true);
    expect(result.isFailure).toBe(false);
    expect(result.value).toBe(42);
  });

  it('carries the error of a failure', () => {
    const error = new ValidationError('invalid');
    const result = Result.fail<number>(error);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe(error);
  });

  it('refuses the value of a failure', () => {
    const result = Result.fail(new ValidationError('invalid'));

    expect(() => result.value).toThrow(ValueOfFailedResultError);
  });

  it('refuses the error of a success', () => {
    expect(() => Result.ok().error).toThrow(ErrorOfSuccessfulResultError);
  });

  it('is frozen', () => {
    expect(Object.isFrozen(Result.ok(1))).toBe(true);
  });
});
