import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  getAdminDashboard,
} from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { ROLES } from '../db/schema.js';

/**
 * ==============================================================================
 * USER & RBAC ROUTES
 * ==============================================================================
 * WHAT THIS FILE DOES:
 * Defines REST endpoints for user management, protected by both JWT authentication
 * and Role-Based Access Control (RBAC) authorization middleware.
 * 
 * WHY CHAIN MIDDLEWARE (authenticate, authorize):
 * 1. `authenticate`: Verifies the JWT Bearer token and populates `req.user` with `{ id, email, role }`.
 * 2. `authorize('admin')`: Inspects `req.user.role`. If the role is not 'admin', it returns HTTP 403 Forbidden.
 * 3. Controller: Executes only if BOTH authentication and RBAC authorization succeed.
 */
const router = Router();

/**
 * @route   GET /api/users
 * @desc    Get all users list
 * @access  Private / Admin only (RBAC: 'admin')
 */
router.get('/', authenticate, authorize(ROLES.ADMIN), getAllUsers);

/**
 * @route   GET /api/users/admin/dashboard
 * @desc    Get administrative dashboard statistics
 * @access  Private / Admin only (RBAC: 'admin')
 */
router.get('/admin/dashboard', authenticate, authorize(ROLES.ADMIN), getAdminDashboard);

/**
 * @route   GET /api/users/:id
 * @desc    Get user profile by ID
 * @access  Private / Authenticated users
 */
router.get('/:id', authenticate, getUserById);

/**
 * @route   PATCH /api/users/:id/role
 * @desc    Update a user's RBAC role (e.g. promote to admin)
 * @access  Private / Admin only (RBAC: 'admin')
 */
router.patch('/:id/role', authenticate, authorize(ROLES.ADMIN), updateUserRole);

export default router;
