import { userRepository } from '../repository/user.repository.js';
import { NotFoundError } from '../error/NotFoundError.js';
import { ROLES } from '../db/schema.js';

/**
 * ==============================================================================
 * USER SERVICE (RBAC & USER MANAGEMENT)
 * ==============================================================================
 * WHAT THIS SERVICE DOES:
 * Handles operations related to user retrieval, profile management, and administrative
 * role modifications for Role-Based Access Control (RBAC).
 * 
 * WHY USE THIS SERVICE:
 * - Keeps user-management logic separate from authentication logic (`auth.service.js`).
 * - Provides admin-specific capabilities like listing all registered users and updating roles.
 */
export class UserService {
  /**
   * Retrieves all registered users in the system.
   * 
   * WHY:
   * Used in Admin dashboard / management APIs protected by RBAC `authorize('admin')`.
   * 
   * @returns {Promise<Array<Object>>} - List of user profiles
   */
  async getAllUsers() {
    return userRepository.findAll();
  }

  /**
   * Retrieves a single user profile by ID.
   * 
   * @param {string} id - User UUID
   * @returns {Promise<Object>} - User profile
   */
  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`User with ID '${id}' not found`);
    }
    return user;
  }

  /**
   * Updates a user's role (Admin-only RBAC feature).
   * 
   * WHY:
   * Enables administrators to promote or demote users (e.g. promoting a 'user' to 'admin').
   * 
   * @param {string} id - User UUID
   * @param {string} newRole - Target role ('user', 'admin', 'moderator')
   * @returns {Promise<Object>} - Updated user profile
   */
  async updateUserRole(id, newRole) {
    // Validate that the target role exists in ROLES
    if (!Object.values(ROLES).includes(newRole)) {
      throw new Error(`Invalid role '${newRole}'. Allowed roles: ${Object.values(ROLES).join(', ')}`);
    }

    const updatedUser = await userRepository.updateRole(id, newRole);
    if (!updatedUser) {
      throw new NotFoundError(`User with ID '${id}' not found`);
    }

    return updatedUser;
  }
}

export const userService = new UserService();
export default userService;
