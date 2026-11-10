import { InvalidPayloadError } from '../errors/invalid-payload.error.js';

export const parseIsoDate = (value: string, field: string): Date => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new InvalidPayloadError(`${field} must be an ISO 8601 date`);
  }
  return date;
};
