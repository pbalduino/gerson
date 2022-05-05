class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.code = "ValidationError";
  }
}

module.exports = {
  ValidationError,
}
