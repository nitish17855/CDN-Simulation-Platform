import { userService } from '../service/user.service.js';
import { NotFoundError } from '../error/NotFoundError.js';

/**
 * ==============================================================================
 * USER CONTROLLER (RBAC-PROTECTED ENDPOINTS)
 * ==============================================================================
 * WHAT THIS CONTROLLER DOES:
 * Provides handlers for user listing, user details, role management, and admin stats.
 * 
 * WHY USE THIS CONTROLLER:
 * - Demonstrates Role-Based Access Control (RBAC) in practice.
 * - These handlers are mounted on routes protected by `authenticate` and `authorize('admin')`.
 */

/**
 * Retrieves all registered users (Admin only).
 * 
 * @route GET /api/users
 */
export async function getAllUsers(req, res) {
  try {
    const users = await userService.getAllUsers();
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('GetAllUsers error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve users',
    });
  }
}

/**
 * Retrieves a specific user by ID.
 * 
 * @route GET /api/users/:id
 */
export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }
    console.error('GetUserById error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve user',
    });
  }
}

/**
 * Updates a user's role (Admin only).
 * 
 * @route PATCH /api/users/:id/role
 */
export async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        error: 'Role is required in request body',
      });
    }

    const updatedUser = await userService.updateUserRole(id, role);
    return res.status(200).json({
      success: true,
      message: `User role successfully updated to '${role}'`,
      data: updatedUser,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Admin dashboard statistics (Admin only).
 * 
 * @route GET /api/users/admin/dashboard
 */
export async function getAdminDashboard(req, res) {
  try {
    const users = await userService.getAllUsers();
    
    // Group counts by role
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      message: 'Admin dashboard data fetched successfully',
      data: {
        totalUsers: users.length,
        roleDistribution: roleCounts,
        adminUser: {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
        },
      },
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch admin dashboard',
    });
  }
}

export default {
  getAllUsers,
  getUserById,
  updateUserRole,
  getAdminDashboard,
};
