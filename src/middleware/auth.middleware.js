import { verifyToken } from '../utils/jwt.js';
import { UnauthorizedError } from '../error/UnauthorizedError.js';

/**
 * ==============================================================================
 * AUTHENTICATION MIDDLEWARE (JWT)
 * ==============================================================================
 * WHAT THIS MIDDLEWARE DOES:
 * 1. Intercepts incoming HTTP requests for protected routes.
 * 2. Extracts the Bearer token from the `Authorization` header (`Authorization: Bearer <token>`).
 * 3. Verifies token integrity and expiration using `verifyToken`.
 * 4. Injects the decoded user payload (`{ id, email, role }`) into `req.user` for downstream handlers.
 * 
 * WHY USE THIS MIDDLEWARE:
 * - Secures endpoints so only authenticated clients with valid JWT tokens can access them.
 * - Decouples JWT verification logic from route handlers and controllers.
 * - Provides the prerequisite `req.user` object needed by the RBAC middleware.
 */
export function authenticate(req, res, next) {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;

    // Check if header is provided and properly formatted with Bearer schema
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authorization header missing or malformed. Expected format: Bearer <token>');
    }

    // Split 'Bearer <token>' and take the token part
    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Token not provided in Authorization header');
    }

    // Verify token: this validates the signature and expiration against our secret
    const decoded = verifyToken(token);

    // Attach decoded user claims ({ id, email, role }) to request object
    // WHY: Downstream controllers and RBAC middleware can access the user's identity and role via req.user
    req.user = decoded;

    // Proceed to next middleware or route handler
    return next();
  } catch (error) {
    // If it's an UnauthorizedError, return 401 with the specific message
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({
        success: false,
        error: error.message,
      });
    }

    // Catch-all for any unexpected authentication failure
    return res.status(401).json({
      success: false,
      error: 'Authentication failed: Invalid or expired token',
    });
  }
}

export default authenticate;
