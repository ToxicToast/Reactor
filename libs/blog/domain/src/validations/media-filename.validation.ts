import { Result, ValidationError } from '@toxictoast/shared-kernel';

export class ValidateMediaFilename {
  constructor(
    private readonly filename: string,
    private readonly maxLength = 255,
  ) {}

  validate(): Result<void> {
    if (!this.filename.trim()) {
      return Result.fail(new ValidationError('Filename must not be empty'));
    }
    if (this.filename.length > this.maxLength) {
      return Result.fail(
        new ValidationError(
          `Filename must not exceed ${this.maxLength} characters`,
        ),
      );
    }
    return Result.ok();
  }
}
