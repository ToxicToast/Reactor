import { status } from '@grpc/grpc-js';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '@toxictoast/shared-kernel';
import { toRpcException } from './to-rpc-exception.function.js';

describe('toRpcException', () => {
  it.each([
    [new NotFoundError('Tag', 'id-1'), status.NOT_FOUND],
    [new ValidationError('title must not be empty'), status.INVALID_ARGUMENT],
    [
      new ConflictError('Post is already published'),
      status.FAILED_PRECONDITION,
    ],
  ])('maps %s to its grpc status', (error, code) => {
    expect(toRpcException(error).getError()).toEqual({
      code,
      message: error.message,
    });
  });
});
