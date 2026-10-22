import { DomainError } from './domain.error.js';

export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
  constructor(entity: string, id: string) {
    super(`${entity} ${id} not found`);
  }
}
