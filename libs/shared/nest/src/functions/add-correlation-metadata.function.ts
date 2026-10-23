import type { Metadata } from '@grpc/grpc-js';
import type { Nullable } from '@toxictoast/shared-types';
import { CORRELATION_METADATA } from '../constants/index.js';

export const addCorrelationMetadata = (
  metadata: Metadata,
  correlationId: Nullable<string>,
): Metadata => {
  if (correlationId) {
    metadata.set(CORRELATION_METADATA, correlationId);
  }
  return metadata;
};
