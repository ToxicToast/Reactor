import {
  type Nullable,
  Result,
  ValidationError,
} from '@toxictoast/shared-kernel';

export class ValidateMediaAltText {
  constructor(
    private readonly altText: Nullable<string>,
    private readonly maxLength = 500,
  ) {}

  validate(): Result<void> {
    if (this.altText && this.altText.length > this.maxLength) {
      return Result.fail(
        new ValidationError(
          `Alt text must not exceed ${this.maxLength} characters`,
        ),
      );
    }
    return Result.ok();
  }
}
