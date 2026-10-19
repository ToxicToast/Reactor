import { Result, ValidationError } from '@toxictoast/shared-kernel';

export class ValidateCommentContent {
  constructor(
    private readonly content: string,
    private readonly maxLength = 5000,
  ) {}

  validate(): Result<void> {
    if (!this.content.trim()) {
      return Result.fail(new ValidationError('Comment must not be empty'));
    }
    if (this.content.length > this.maxLength) {
      return Result.fail(
        new ValidationError(
          `Comment must not exceed ${this.maxLength} characters`,
        ),
      );
    }
    return Result.ok();
  }
}
