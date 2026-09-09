/**
 * ==============================================================================
 * NOT FOUND ERROR (404)
 * ==============================================================================
 * WHAT IT IS:
 * Custom Error class thrown when a requested resource (e.g. user ID, file, record)
 * cannot be found in the database.
 * 
 * WHY USE A CUSTOM ERROR CLASS:
 * 1. Enables controllers to handle missing records cleanly and return standard 404 HTTP status.
 */
export class NotFoundError extends Error {
  /**
   * @param {string} [message="Resource not found"] - Descriptive error message
   */
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404; // Standard HTTP 404 Not Found status code
  }
}
