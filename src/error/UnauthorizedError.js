/**
 * ==============================================================================
 * UNAUTHORIZED ERROR (401)
 * ==============================================================================
 * WHAT IT IS:
 * Custom Error class thrown when authentication fails or when a valid JWT token
 * is missing, expired, or malformed.
 * 
 * WHY USE A CUSTOM ERROR CLASS:
 * 1. Allows middleware and controller error handlers to distinguish authentication
 *    failures (`instanceof UnauthorizedError`) from internal server bugs or other errors.
 * 2. Keeps HTTP status code logic cleanly separated from business logic.
 */
export class UnauthorizedError extends Error {
  /**
   * @param {string} [message="Unauthorized access"] - Descriptive error message
   */
  constructor(message = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401; // Standard HTTP 401 Unauthorized status code
  }
}
