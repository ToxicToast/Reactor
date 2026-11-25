import { Result, ValidationError } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import { LINK_LIMITS } from '../constants/index.js';

export const normalizeDescription = (
  value: Nullable<string>,
): Result<Nullable<string>> => {
  const trimmed = value?.trim() ?? '';
  if (trimmed.length === 0) {
    return Result.ok(null);
  }
  if (trimmed.length > LINK_LIMITS.DESCRIPTION_MAX) {
    return Result.fail(
      new ValidationError(
        `Description must not exceed ${LINK_LIMITS.DESCRIPTION_MAX} characters`,
      ),
    );
  }
  return Result.ok(trimmed);
};
