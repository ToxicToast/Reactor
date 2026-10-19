import { Result, ValidationError } from '@toxictoast/shared-kernel';

export class ValidatePostPublishedAt {
  constructor(
    private readonly publishedAt: Date,
    private readonly now: Date,
  ) {}

  validate(): Result<void> {
    if (Number.isNaN(this.publishedAt.getTime())) {
      return Result.fail(new ValidationError('Published date is invalid'));
    }
    if (this.publishedAt > this.now) {
      return Result.fail(
        new ValidationError('Published date must not be in the future'),
      );
    }
    return Result.ok();
  }
}
