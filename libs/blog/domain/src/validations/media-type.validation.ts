import { Result, ValidationError } from '@toxictoast/shared-kernel';

export class ValidateMediaType {
  constructor(
    private readonly mimeType: string,
    private readonly allowedTypes: ReadonlyArray<string> = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/avif',
    ],
  ) {}

  validate(): Result<void> {
    if (!this.allowedTypes.includes(this.mimeType)) {
      return Result.fail(
        new ValidationError(`Media type ${this.mimeType} is not allowed`),
      );
    }
    return Result.ok();
  }
}
