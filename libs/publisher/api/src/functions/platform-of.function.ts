import {
  isPlatform,
  Platforms,
  type Platform,
} from '@toxictoast/publisher-domain';
import {
  InvalidPayloadError,
  type PayloadReader,
} from '@toxictoast/shared-kernel';

export const platformOf = (payload: PayloadReader): Platform => {
  const value = payload.string('platform');
  if (!isPlatform(value)) {
    throw new InvalidPayloadError(
      `platform must be one of ${Object.values(Platforms).join(', ')}`,
    );
  }
  return value;
};
