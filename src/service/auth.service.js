import bcrypt from 'bcryptjs';
import { userRepository } from '../repository/user.repository.js';
import { generateToken } from '../utils/jwt.js';
import { ROLES } from '../db/schema.js';
import { InvalidCredentialsError } from '../error/InvalidCredentials.js';
import { InvalidPassword } from '../error/InvalidPassword.js';
import { Useralreadyexist } from '../error/InvalidCredentials.js';

/**
 * ==============================================================================
 * AUTHENTICATION SERVICE (BUSINESS LOGIC LAYER)
 * ==============================================================================
 * WHAT WE FIXED & ADDED:
 * 1. Fixed bcrypt password comparison bug: previously compared `bcrypt.compare(password, password)`
 *    instead of comparing the plain password with the retrieved `user_password` hash from database.
 * 2. Integrated JWT token generation (`generateToken`) on successful registration and login.
 * 3. Encoded user identity and RBAC role `{ id, email, role }` into the JWT payload.
 * 4. Added role validation (ensures only allowed roles like 'user' or 'admin' can be assigned).
 * 5. Provided both static and instance methods so `AuthService.login(...)` works seamlessly.
 * 
 * WHY USE A SERVICE LAYER:
 * - Keeps controllers lean: controllers only parse HTTP requests and send HTTP responses.
 * - Centralizes business logic: validation, hashing, token issuance, and orchestrating repositories.
 */
export class AuthService {
  /**
   * Registers a new user, hashes their password, assigns an RBAC role, and generates a JWT.
   * 
   * WHY EACH STEP IS PERFORMED:
   * 1. Check if email already exists: Prevents duplicate account conflicts (throws Useralreadyexist).
   * 2. Validate/assign role: Assigns 'user' by default or requested role if valid (RBAC support).
   * 3. Hash password: Uses bcrypt with salt rounds (10) so plain-text passwords are never stored.
   * 4. Persist user in DB: Calls `userRepository.createUser`.
   * 5. Generate JWT token: Encodes `{ id, email, role }` so user is immediately authenticated.
   * 
   * @param {Object} params
   * @param {string} params.email - User email
   * @param {string} params.name - User name
   * @param {string} params.password - Plain-text password
   * @param {string} [params.role=ROLES.USER] - Optional role ('user', 'admin')
   * @returns {Promise<{ user: Object, token: string }>} - User profile and JWT token
   */
  async signup({ email, name, password, role = ROLES.USER }) {
    // 1. Check for existing user with this email
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Useralreadyexist();
    }

    // 2. Validate role against standard roles list for RBAC safety
    const assignedRole = Object.values(ROLES).includes(role) ? role : ROLES.USER;

    // 3. Hash password with bcrypt (10 salt rounds provides strong security vs performance balance)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Insert user into database
    const newUser = await userRepository.createUser({
      email,
      name,
      password: hashedPassword,
      role: assignedRole,
    });

    // 5. Generate JWT token containing identity & RBAC claims
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
      token,
    };
  }

  /**
   * Authenticates a user by email + password and issues a JWT token with RBAC role.
   * 
   * WHY EACH STEP IS PERFORMED:
   * 1. Find user by email: Checks if the user exists. If not, throws InvalidCredentialsError.
   * 2. Retrieve password hash: Fetches the stored bcrypt hash from database.
   * 3. Compare password: Uses `bcrypt.compare` to securely verify the plain password against the hash.
   * 4. Generate JWT token: Issues token with payload `{ id: user.id, email: user.email, role: user.role }`.
   * 
   * @param {string} email - User's email
   * @param {string} password - User's plain password
   * @returns {Promise<{ user: Object, token: string }>} - Authenticated user details and signed JWT
   */
  async login(email, password) {
    // 1. Verify user exists
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    // 2. Fetch the stored password hash
    const storedPasswordHash = await userRepository.findPasswordByEmail(email);
    if (!storedPasswordHash) {
      throw new InvalidCredentialsError();
    }

    // 3. Compare incoming password with stored hash
    // FIX: bcrypt.compare(plainTextPassword, storedHashedPassword)
    const isPasswordCorrect = await bcrypt.compare(password, storedPasswordHash);
    if (!isPasswordCorrect) {
      throw new InvalidPassword();
    }

    // 4. Generate JWT token with user ID and RBAC role
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Fetches fresh user profile by ID (used for /me endpoint).
   * 
   * @param {string} userId - User UUID
   * @returns {Promise<Object|null>} - User profile (without password)
   */
  async getMe(userId) {
    const user = await userRepository.findById(userId);
    return user;
  }
}

// Instantiate singleton instance
export const authService = new AuthService();

// Static method compatibility bridge so `Authservice.login()` / `AuthService.login()` work directly
export const Authservice = {
  login: (email, password) => authService.login(email, password),
  signup: (params) => {
    // Handle both object argument { email, name, password, role } and positional arguments
    if (typeof params === 'object') {
      return authService.signup(params);
    }
    const [email, name, password, role] = arguments;
    return authService.signup({ email, name, password, role });
  },
  getMe: (userId) => authService.getMe(userId),
};

export default authService;
