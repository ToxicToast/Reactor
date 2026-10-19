import {
  type Nullable,
  Result,
  ValidationError,
} from '@toxictoast/shared-kernel';

export class ValidatePostExcerpt {
  constructor(
    private readonly excerpt: Nullable<string>,
    private readonly maxLength = 500,
  ) {}

  validate(): Result<void> {
    if (this.excerpt && this.excerpt.length > this.maxLength) {
      return Result.fail(
        new ValidationError(
          `Excerpt must not exceed ${this.maxLength} characters`,
        ),
      );
    }
    return Result.ok();
  }
}
