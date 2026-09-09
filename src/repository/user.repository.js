import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { users, ROLES } from '../db/schema.js';

/**
 * ==============================================================================
 * USER REPOSITORY (DATA ACCESS LAYER)
 * ==============================================================================
 * WHAT WE FIXED & ADDED:
 * 1. Imported `db` from `../config/database.js` and `eq` from `drizzle-orm` (previously missing, causing runtime ReferenceError).
 * 2. Added support for `role` in user creation and queries for RBAC.
 * 3. Added `findById`, `findAll`, and `updateRole` methods.
 * 4. Provided both instance and static methods / named exports so any import style works smoothly.
 * 
 * WHY USE A REPOSITORY PATTERN:
 * - Separation of Concerns: The repository layer isolates all raw database operations
 *   (Drizzle ORM queries) from the service layer.
 * - Maintainability & Testability: Services don't need to know SQL/ORM specifics; they simply call
 *   methods like `userRepository.findByEmail(email)`.
 */
export class UserRepository {
  /**
   * Finds a user by their unique email address.
   * 
   * WHY:
   * Used during login to locate the account and during signup to prevent duplicate accounts.
   * 
   * @param {string} email - Email address to search for
   * @returns {Promise<Object|null>} - User record or null if not found
   */
  async findByEmail(email) {
    // We query the userTable where email equals the supplied parameter
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Retrieves the password hash for a given user email.
   * 
   * WHY:
   * Keeps password retrieval isolated so general user queries don't accidentally leak
   * password hashes into application responses or logs.
   * 
   * @param {string} email - User email
   * @returns {Promise<string|null>} - Hashed password string or null
   */
  async findPasswordByEmail(email) {
    const result = await db
      .select({ password: users.password })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0]?.password || null;
  }

  /**
   * Finds a user by their unique UUID ID.
   * 
   * WHY:
   * Used by JWT authentication middleware or profile endpoints to fetch fresh user state.
   * 
   * @param {string} id - User UUID
   * @returns {Promise<Object|null>} - User record (without password) or null
   */
  async findById(id) {
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Inserts a new user record into the database.
   * 
   * WHY:
   * Creates new user records with specified or default role ('user') and hashed password.
   * Returns the created record (excluding password) using Drizzle's `.returning()`.
   * 
   * @param {Object} userData - User details
   * @param {string} userData.email - User email
   * @param {string} userData.name - User full name
   * @param {string} userData.password - Hashed password
   * @param {string} [userData.role=ROLES.USER] - User role for RBAC
   * @returns {Promise<Object>} - Newly created user record
   */
  async createUser({ email, name, password, role = ROLES.USER }) {
    const result = await db
      .insert(users)
      .values({
        email,
        name,
        password,
        role,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return result[0];
  }

  /**
   * Retrieves all users in the system (Admin only).
   * 
   * WHY:
   * Used for RBAC demonstration and administrative user management.
   * 
   * @returns {Promise<Array<Object>>} - List of users
   */
  async findAll() {
    return db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);
  }

  /**
   * Updates the role of a user (Admin only).
   * 
   * WHY:
   * Enables dynamic role escalation/demotion (e.g. promoting 'user' to 'admin').
   * 
   * @param {string} id - User UUID
   * @param {string} role - New role
   * @returns {Promise<Object|null>} - Updated user or null
   */
  async updateRole(id, role) {
    const result = await db
      .update(users)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return result[0] || null;
  }
}

// Instantiate singleton repository instance for export
export const userRepository = new UserRepository();

// Named function exports for direct compatibility
export const findbyemail = (email) => userRepository.findByEmail(email);
export const findPassword = (email) => userRepository.findPasswordByEmail(email);
export const findById = (id) => userRepository.findById(id);
export const createUser = (data) => userRepository.createUser(data);

export default userRepository;
