import { Result } from '@toxictoast/shared-kernel';
import type { LinkData } from '../data/index.js';
import { normalizeDescription } from './normalize-description.function.js';
import { normalizeTargetUrl } from './normalize-target-url.function.js';

export const normalizeLinkData = (data: LinkData): Result<LinkData> => {
  const targetUrl = normalizeTargetUrl(data.target_url);
  if (targetUrl.isFailure) {
    return Result.fail(targetUrl.error);
  }
  const description = normalizeDescription(data.description);
  if (description.isFailure) {
    return Result.fail(description.error);
  }
  return Result.ok({
    target_url: targetUrl.value,
    description: description.value,
  });
};
