import { ForbiddenError } from '../error/ForbiddenError.js';
import { UnauthorizedError } from '../error/UnauthorizedError.js';

/**
 * ==============================================================================
 * ROLE-BASED ACCESS CONTROL (RBAC) MIDDLEWARE
 * ==============================================================================
 * WHAT THIS MIDDLEWARE DOES:
 * Provides a higher-order middleware factory `authorize(...allowedRoles)` to restrict
 * access to route handlers based on the user's role (e.g. 'admin', 'user', 'moderator').
 * 
 * WHY USE A HIGHER-ORDER FUNCTION:
 * A higher-order function takes configuration parameters (the list of roles permitted
 * to access the route) and returns a standard Express middleware function `(req, res, next)`.
 * 
 * EXAMPLE USAGE:
 * - Route accessible only by Admin:
 *   `router.get('/admin-dashboard', authenticate, authorize('admin'), adminController)`
 * - Route accessible by Admin OR Moderator:
 *   `router.get('/manage-content', authenticate, authorize('admin', 'moderator'), manageController)`
 * - Route accessible by any authenticated user:
 *   `router.get('/profile', authenticate, authorize('user', 'admin'), profileController)`
 */

/**
 * Higher-order middleware factory for Role-Based Access Control.
 * 
 * @param {...string} allowedRoles - List of roles permitted to access this endpoint
 * @returns {Function} - Express middleware function
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    try {
      // 1. Ensure authentication was performed first and req.user exists
      // WHY: RBAC depends on the user identity and role established by JWT authentication
      if (!req.user || !req.user.role) {
        throw new UnauthorizedError('User authentication required before authorization check');
      }

      const userRole = req.user.role;

      // 2. If allowedRoles is specified, check if user's role is in the allowed list
      // WHY: Prevents unauthorized roles (e.g. a standard 'user' accessing 'admin' endpoints)
      if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        throw new ForbiddenError(
          `Access denied: Role '${userRole}' is not authorized to access this resource. Required role(s): ${allowedRoles.join(', ')}`
        );
      }

      // 3. User has the required role -> Proceed to next middleware or controller
      return next();
    } catch (error) {
      // If user is unauthenticated
      if (error instanceof UnauthorizedError) {
        return res.status(401).json({
          success: false,
          error: error.message,
        });
      }

      // If user is authenticated but role is not authorized (HTTP 403 Forbidden)
      if (error instanceof ForbiddenError) {
        return res.status(403).json({
          success: false,
          error: error.message,
        });
      }

      // Generic fallback error
      return res.status(500).json({
        success: false,
        error: 'An error occurred while checking permissions',
      });
    }
  };
}

// Named alias for clarity
export const requireRoles = authorize;

export default {
  authorize,
  requireRoles,
};
