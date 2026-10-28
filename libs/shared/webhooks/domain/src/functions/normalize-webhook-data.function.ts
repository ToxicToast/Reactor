import { Result, ValidationError } from '@toxictoast/shared-kernel';
import type { Nullable, Optional } from '@toxictoast/shared-types';
import { WEBHOOK_LIMITS } from '../constants/index.js';
import type { WebhookData, WebhookDataInput } from '../data/index.js';

const EVENT_PATTERN = /^(\*|[a-z0-9_-]+(\.[a-z0-9_-]+)*(\.\*)?)$/;
const PROTOCOLS: ReadonlySet<string> = new Set(['http:', 'https:']);

const normalizeDescription = (
  description: Optional<Nullable<string>>,
): Nullable<string> => {
  const trimmed = description?.trim() ?? '';
  return trimmed.length === 0 ? null : trimmed;
};

export const normalizeWebhookData = (
  data: WebhookDataInput,
): Result<WebhookData> => {
  const url = data.url.trim();
  if (url.length > WEBHOOK_LIMITS.URL_LENGTH || !URL.canParse(url)) {
    return Result.fail(new ValidationError(`Invalid webhook url ${data.url}`));
  }
  const parsed = new URL(url);
  if (!PROTOCOLS.has(parsed.protocol)) {
    return Result.fail(
      new ValidationError('Webhook url must use http or https'),
    );
  }
  if (parsed.username !== '' || parsed.password !== '') {
    return Result.fail(
      new ValidationError('Webhook url must not contain credentials'),
    );
  }

  const events = [...new Set(data.events.map((event) => event.trim()))].sort();
  if (events.length === 0 || events.length > WEBHOOK_LIMITS.EVENTS) {
    return Result.fail(
      new ValidationError(
        `A webhook needs between 1 and ${WEBHOOK_LIMITS.EVENTS} events`,
      ),
    );
  }
  const invalid = events.filter((event) => !EVENT_PATTERN.test(event));
  if (invalid.length > 0) {
    return Result.fail(
      new ValidationError(`Invalid event patterns: ${invalid.join(', ')}`),
    );
  }

  const description = normalizeDescription(data.description);
  if (
    description !== null &&
    description.length > WEBHOOK_LIMITS.DESCRIPTION_LENGTH
  ) {
    return Result.fail(
      new ValidationError(
        `Description must be at most ${WEBHOOK_LIMITS.DESCRIPTION_LENGTH} characters`,
      ),
    );
  }

  return Result.ok({ url: parsed.toString(), events, description });
};
