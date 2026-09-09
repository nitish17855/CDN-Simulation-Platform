/**
 * ==============================================================================
 * INVALID CREDENTIALS & USER ALREADY EXISTS ERRORS
 * ==============================================================================
 * WHAT WE FIXED:
 * 1. Exported `InvalidCredentialsErrors` (and alias `InvalidCredentialsError`) for auth errors.
 * 2. Exported `Useralreadyexist` (and alias `UserAlreadyExistsError`) for duplicate registrations.
 * 3. Added HTTP status codes (`statusCode = 401` and `statusCode = 409`) and detailed JSDoc comments.
 * 
 * WHY USE THESE CLASSES:
 * - `InvalidCredentialsErrors`: Thrown during login when no user is found with the provided email.
 * - `Useralreadyexist`: Thrown during registration when an account with that email already exists.
 */

export class InvalidCredentialsErrors extends Error {
  constructor(message = 'Invalid email or credentials') {
    super(message);
    this.name = 'InvalidCredentialsError';
    this.statusCode = 401; // Unauthorized
  }
}

// Alias for standard naming conventions
export const InvalidCredentialsError = InvalidCredentialsErrors;

export class Useralreadyexist extends Error {
  constructor(message = 'User with this email already exists') {
    super(message);
    this.name = 'UserAlreadyExistsError';
    this.statusCode = 409; // 409 Conflict is the standard HTTP code for existing resource conflicts
  }
}

// Alias for standard naming conventions
export const UserAlreadyExistsError = Useralreadyexist;