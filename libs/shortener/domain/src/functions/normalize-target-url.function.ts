import { Result, ValidationError } from '@toxictoast/shared-kernel';
import { LINK_LIMITS, LINK_PROTOCOLS } from '../constants/index.js';

export const normalizeTargetUrl = (value: string): Result<string> => {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return Result.fail(new ValidationError('Target url must not be empty'));
  }
  if (trimmed.length > LINK_LIMITS.TARGET_URL_MAX) {
    return Result.fail(
      new ValidationError(
        `Target url must not exceed ${LINK_LIMITS.TARGET_URL_MAX} characters`,
      ),
    );
  }
  if (!URL.canParse(trimmed)) {
    return Result.fail(new ValidationError('Target url is not a valid url'));
  }

  const url = new URL(trimmed);
  if (!LINK_PROTOCOLS.has(url.protocol)) {
    return Result.fail(
      new ValidationError('Target url must use http or https'),
    );
  }
  return Result.ok(url.toString());
};
