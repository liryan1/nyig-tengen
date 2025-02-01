export class SuicideError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SuicideError";
    // Set the prototype explicitly to maintain the correct prototype chain
    Object.setPrototypeOf(this, SuicideError.prototype);
  }
}

export class StoneExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoneExistsError";
    // Set the prototype explicitly to maintain the correct prototype chain
    Object.setPrototypeOf(this, StoneExistsError.prototype);
  }
}
