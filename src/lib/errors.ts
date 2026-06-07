/**
 * Domain error with an HTTP status. Services throw these; the API layer maps
 * them to JSON responses.
 */
export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly status: number = 400,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "not_found");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409, "conflict");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "unauthorized");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Not allowed") {
    super(message, 403, "forbidden");
  }
}

export class ValidationError extends AppError {
  constructor(
    message = "Invalid request",
    public readonly details?: unknown,
  ) {
    super(message, 422, "validation_error");
  }
}
