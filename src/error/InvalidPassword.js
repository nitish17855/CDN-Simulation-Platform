/**
 * ==============================================================================
 * INVALID PASSWORD ERROR
 * ==============================================================================
 * WHAT WE FIXED:
 * 1. Added HTTP `statusCode = 401` (Unauthorized) instead of generic 400.
 * 2. Added detailed documentation and comments.
 * 
 * WHY USE THIS CLASS:
 * - Thrown by `AuthService.login` when `bcrypt.compare` returns false.
 * - Distinguishes incorrect password from other business errors.
 */

export class InvalidPassword extends Error {
  constructor(message = 'Invalid password') {
    super(message);
    this.name = 'InvalidPassword';
    this.statusCode = 401; // 401 Unauthorized is appropriate for failed credential validation
  }
}

// Alias for standard naming convention
export const InvalidPasswordError = InvalidPassword;