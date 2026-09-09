import { Router } from 'express';
import { login, signup, register, getMe } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

/**
 * ==============================================================================
 * AUTHENTICATION ROUTES
 * ==============================================================================
 * WHAT WE FIXED & ADDED:
 * 1. Fixed syntax error where `router.post('/signup', )` was empty.
 * 2. Fixed import of controllers (named imports instead of faulty default import).
 * 3. Added `POST /api/auth/register` and `POST /api/auth/signup` routes.
 * 4. Added `POST /api/auth/login` route.
 * 5. Added protected `GET /api/auth/me` route using `authenticate` JWT middleware.
 * 
 * WHY USE MIDDLEWARE IN ROUTES:
 * - Chaining `authenticate` on `router.get('/me', authenticate, getMe)` ensures that
 *   unauthenticated requests are rejected immediately with 401 before reaching the controller.
 */
const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account & get JWT token
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/signup
 * @desc    Alias for register
 * @access  Public
 */
router.post('/signup', signup);

/**
 * @route   POST /api/auth/login
 * @desc    Login with email & password to receive JWT token
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user profile
 * @access  Private (Requires valid JWT Bearer token)
 */
router.get('/me', authenticate, getMe);

export default router;
