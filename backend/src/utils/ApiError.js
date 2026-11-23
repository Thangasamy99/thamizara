export default class ApiError extends Error {
  constructor(status, message, errors = undefined) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.expose = status < 500;
  }

  static badRequest(msg, errors) { return new ApiError(400, msg, errors); }
  static unauthorized(msg = "Authentication required") { return new ApiError(401, msg); }
  static forbidden(msg = "You do not have permission to perform this action") { return new ApiError(403, msg); }
  static notFound(msg = "Resource not found") { return new ApiError(404, msg); }
  static conflict(msg, errors) { return new ApiError(409, msg, errors); }
  static tooMany(msg = "Too many requests, please try again later") { return new ApiError(429, msg); }
}
