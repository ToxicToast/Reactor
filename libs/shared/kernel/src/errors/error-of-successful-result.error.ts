export class ErrorOfSuccessfulResultError extends Error {
  constructor() {
    super("Can't get the error of a successful result. Use 'value' instead.");
    this.name = 'ErrorOfSuccessfulResultError';
  }
}
