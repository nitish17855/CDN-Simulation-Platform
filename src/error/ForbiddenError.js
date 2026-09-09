/**
 * ==============================================================================
 * FORBIDDEN ERROR (403) - RBAC PERMISSION DENIED
 * ==============================================================================
 * WHAT IT IS:
 * Custom Error class thrown when an authenticated user attempts to access a resource
 * or endpoint that requires a higher role or permission than the user's assigned role.
 * 
 * WHY USE A CUSTOM ERROR CLASS:
 * 1. Clearly separates 401 (Authentication failed / Not logged in) from 403 (Authorization
 *    failed / Logged in but insufficient role permissions).
 * 2. Provides consistent error responses across all RBAC-protected routes.
 */
export class ForbiddenError extends Error {
  /**
   * @param {string} [message="Access denied: insufficient permissions"] - Descriptive error message
   */
  constructor(message = 'Access denied: insufficient permissions') {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403; // Standard HTTP 403 Forbidden status code
  }
}
