import { Result, ValidationError } from '@toxictoast/shared-kernel';

export const validateWebhookSecret = (secret: string): Result<void> => {
  if (secret.length === 0) {
    return Result.fail(new ValidationError('Secret must not be empty'));
  }
  return Result.ok();
};
