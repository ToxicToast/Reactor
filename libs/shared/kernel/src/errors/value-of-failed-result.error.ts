export class ValueOfFailedResultError extends Error {
  constructor() {
    super("Can't get the value of a failed result. Use 'error' instead.");
    this.name = 'ValueOfFailedResultError';
  }
}
