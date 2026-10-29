import { PayloadReader } from '../classes/payload-reader.js';
import { Result } from '../classes/result.class.js';
import { InvalidPayloadError } from '../errors/invalid-payload.error.js';
import { ValidationError } from '../errors/validation.error.js';

export const readPayload = <T>(
  payload: unknown,
  read: (reader: PayloadReader) => T,
): Result<T> => {
  try {
    return Result.ok(read(new PayloadReader(payload)));
  } catch (error: unknown) {
    if (error instanceof InvalidPayloadError) {
      return Result.fail(new ValidationError(error.message));
    }
    throw error;
  }
};
