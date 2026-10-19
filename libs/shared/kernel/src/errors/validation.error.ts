import { DomainError } from './domain.error.js';

export class ValidationError extends DomainError {
  readonly code = 'VALIDATION';
  constructor(message: string) {
    super(message);
  }
}
