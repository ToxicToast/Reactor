import { Result, ValidationError } from '@toxictoast/shared-kernel';

export class ValidatePostTitle {
  constructor(
    private readonly title: string,
    private readonly maxLength = 255,
  ) {}

  validate(): Result<void> {
    if (!this.title.trim()) {
      return Result.fail(new ValidationError('Title must not be empty'));
    }
    if (this.title.length > this.maxLength) {
      return Result.fail(
        new ValidationError(
          `Title must not exceed ${this.maxLength} characters`,
        ),
      );
    }
    return Result.ok();
  }
}
