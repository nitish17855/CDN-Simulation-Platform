import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { UnauthorizedError } from '../error/UnauthorizedError.js';

/**
 * ==============================================================================
 * JWT (JSON WEB TOKEN) UTILITIES
 * ==============================================================================
 * WHAT THIS FILE DOES:
 * Provides standardized helper functions for creating (signing) and validating (verifying)
 * JSON Web Tokens used for stateless authentication and RBAC claims.
 * 
 * WHY JWT IS USED:
 * - Stateless Authentication: The server does not need to store active session tokens in memory or DB.
 * - RBAC Claims: The user's assigned role (`req.user.role`) is securely encoded in the token payload,
 *   allowing RBAC middleware to make authorization decisions instantly without extra database hits on every request.
 */

/**
 * Generates a signed JWT token containing user identity and role claims.
 * 
 * WHY:
 * Encodes the essential user payload (id, email, role) into a tamper-proof signed string.
 * 
 * @param {Object} payload - Data to embed in the token payload (e.g. { id, email, role })
 * @param {string} [expiresIn] - Optional override for token expiration (defaults to env.jwt.expiresIn)
 * @returns {string} - Signed JWT token string
 */
export function generateToken(payload, expiresIn = env.jwt.expiresIn) {
  // We use jwt.sign with the server's secret key and configured expiration (e.g. '7d' or '24h')
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn,
  });
}

/**
 * Verifies the validity and signature of a JWT token.
 * 
 * WHY:
 * Validates that:
 * 1. The token was signed by our server's secret (tamper check).
 * 2. The token has not expired.
 * 3. The token format is valid.
 * 
 * Throws an UnauthorizedError if verification fails so middleware can return HTTP 401.
 * 
 * @param {string} token - The raw JWT token string (without 'Bearer ' prefix)
 * @returns {Object} - The decoded payload (e.g. { id, email, role, iat, exp })
 * @throws {UnauthorizedError} - If token is expired, invalid, or malformed
 */
export function verifyToken(token) {
  try {
    // jwt.verify checks the signature against env.jwt.secret and validates expiration
    const decoded = jwt.verify(token, env.jwt.secret);
    return decoded;
  } catch (error) {
    // We catch jsonwebtoken-specific errors and convert them to our application's UnauthorizedError
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token has expired. Please login again.');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Invalid token signature or format.');
    }
    throw new UnauthorizedError('Authentication token verification failed.');
  }
}

/**
 * Decodes a JWT token without verifying the signature (useful for debugging/inspection).
 * 
 * @param {string} token - The raw JWT token string
 * @returns {Object|null} - Decoded payload or null if invalid
 */
export function decodeToken(token) {
  return jwt.decode(token);
}

export default {
  generateToken,
  verifyToken,
  decodeToken,
};
