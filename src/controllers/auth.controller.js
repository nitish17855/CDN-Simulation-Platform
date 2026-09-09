import { InvalidCredentialsErrors, Useralreadyexist } from '../error/InvalidCredentials.js';
import { InvalidPassword } from '../error/InvalidPassword.js';
import { authService } from '../service/auth.service.js';

/**
 * ==============================================================================
 * AUTHENTICATION CONTROLLER (HTTP REQUEST / RESPONSE HANDLER)
 * ==============================================================================
 * WHAT WE FIXED & ADDED:
 * 1. Fixed broken imports (added `.js` extensions for ES Modules compatibility).
 * 2. Fixed `signup` argument bug: previously only passed `email`, now passes `{ email, name, password, role }`.
 * 3. Returns HTTP 201 for registration, HTTP 200 for login and /me.
 * 4. Returns newly issued JWT token and user info in responses.
 * 5. Added `getMe` controller to demonstrate JWT verification endpoint.
 * 
 * WHY USE A CONTROLLER LAYER:
 * - Decouples HTTP concerns (status codes, headers, req.body parsing) from core business logic.
 * - Handles exceptions gracefully and formats consistent JSON error responses.
 */

/**
 * Handles user login requests.
 * 
 * WHY:
 * Validates presence of email & password, delegates verification to AuthService,
 * and sends back HTTP 200 with user profile and signed JWT token.
 * 
 * @route POST /api/auth/login
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Call service layer to authenticate and generate JWT token
    const result = await authService.login(email, password);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    // 401: Invalid credentials or user not found
    if (error instanceof InvalidCredentialsErrors) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // 401: Incorrect password
    if (error instanceof InvalidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred during login',
    });
  }
}

/**
 * Handles user registration (signup) requests.
 * 
 * WHY:
 * Validates inputs, passes full registration details (including optional RBAC role) to AuthService,
 * and returns HTTP 201 Created with the new user profile and JWT token.
 * 
 * @route POST /api/auth/signup or POST /api/auth/register
 */
export async function signup(req, res) {
  try {
    const { email, name, password, role } = req.body;

    // Validate required fields
    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required',
      });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address',
      });
    }

    // Call service layer to create user, hash password, and generate JWT token
    // FIX: Passing full object { email, name, password, role }
    const result = await authService.signup({
      email,
      name,
      password,
      role,
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    // 409 Conflict: Email is already registered
    if (error instanceof Useralreadyexist) {
      return res.status(409).json({
        success: false,
        error: 'A user with this email already exists',
      });
    }

    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred during registration',
    });
  }
}

// Named alias for register
export const register = signup;

/**
 * Handles fetching current authenticated user's profile.
 * 
 * WHY:
 * Demonstrates JWT authentication. Uses `req.user` attached by the `authenticate` middleware
 * to fetch and return the current user's profile.
 * 
 * @route GET /api/auth/me (Protected by authenticate middleware)
 */
export async function getMe(req, res) {
  try {
    // req.user is populated by authenticate middleware from JWT token
    const userId = req.user.id;
    const user = await authService.getMe(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('GetMe error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve user profile',
    });
  }
}

export default {
  login,
  signup,
  register,
  getMe,
};