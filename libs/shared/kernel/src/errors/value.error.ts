export class onErrorValueError extends Error {
  constructor() {
    super("Can't get the value of a failed result. Use 'error' instead.");
  }
}

export class onValueError extends Error {
  constructor() {
    super("Can't get the error of a successful result. Use 'value' instead.");
  }
}
