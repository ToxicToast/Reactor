import { Result, ValidationError } from '@toxictoast/shared-kernel';

export class ValidateMediaSize {
  constructor(
    private readonly size: number,
    private readonly maxSize: number = 10 * 1024 * 1024,
  ) {}

  validate(): Result<void> {
    if (!Number.isInteger(this.size) || this.size <= 0) {
      return Result.fail(
        new ValidationError('Media size must be a positive number of bytes'),
      );
    }
    if (this.size > this.maxSize) {
      return Result.fail(
        new ValidationError(`Media size must not exceed ${this.maxSize} bytes`),
      );
    }
    return Result.ok();
  }
}
