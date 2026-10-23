import { isUuid } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import { CORRELATION_METADATA } from '../constants/index.js';
import type { GrpcMetadata } from '../interfaces/index.js';

export const correlationFromMetadata = (
  metadata: GrpcMetadata,
): Nullable<string> => {
  const value = metadata.get(CORRELATION_METADATA)[0];
  if (!isUuid(value)) {
    return null;
  }
  return value;
};
