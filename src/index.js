import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import env from './config/env.js';
import setupSwagger from './utils/swagger.js';

// Route Imports
import authRoutes from './route/auth.route.js';
import userRoutes from './route/user.route.js';
import healthRoutes from './route/health.route.js';

/**
 * ==============================================================================
 * APPLICATION ENTRY POINT
 * ==============================================================================
 * WHAT WE FIXED & ADDED:
 * 1. Fixed route import paths to match the `src/route/` folder structure.
 * 2. Mounted `userRoutes` (`/api/users`) to provide RBAC-protected administrative and profile routes.
 * 3. Mounted `healthRoutes` (`/api/health`) for DB/Redis status monitoring.
 * 4. Added comprehensive comments explaining middleware stack and route mounting.
 */

const app = express();

// --------------- Global Middleware ---------------

// Helmet: Security middleware that sets secure HTTP response headers to protect against common web vulnerabilities
app.use(helmet());

// CORS: Enables Cross-Origin Resource Sharing so frontend applications can communicate with the API
app.use(cors());

// Express JSON: Parses incoming requests with JSON payloads and populates req.body
app.use(express.json());

// URL-Encoded: Parses incoming requests with URL-encoded payloads
app.use(express.urlencoded({ extended: true }));

// Morgan: HTTP request logger for development and debugging
app.use(morgan('dev'));

// --------------- Swagger Documentation ---------------
// Mounts Swagger UI at /api-docs
setupSwagger(app);

// --------------- Route Handlers ---------------
// Auth Routes: Public registration, login, and token-based /me profile
app.use('/api/auth', authRoutes);

// User Routes: Protected user management & RBAC-restricted endpoints (e.g. admin dashboard)
app.use('/api/users', userRoutes);

// Health Routes: Public health probe verifying database and redis connectivity
app.use('/api/health', healthRoutes);

// Root information endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'CDN Backend API',
    docs: '/api-docs',
    health: '/api/health',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (Bearer Token required)',
      },
      users: {
        allUsers: 'GET /api/users (Admin only)',
        adminDashboard: 'GET /api/users/admin/dashboard (Admin only)',
        userById: 'GET /api/users/:id (Authenticated)',
        updateRole: 'PATCH /api/users/:id/role (Admin only)',
      },
    },
  });
});

// --------------- 404 Handler ---------------
// Catches all unmatched routes and returns standard 404 response
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// --------------- Global Error Handler ---------------
// Catches unhandled errors from route handlers to prevent server crashes
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.statusCode || 500;
  return res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// --------------- Start Server ---------------
app.listen(env.port, () => {
  console.log(`
  🚀 Server running on http://localhost:${env.port}
  📚 API Docs:   http://localhost:${env.port}/api-docs
  💚 Health:     http://localhost:${env.port}/api/health
  🌍 Env:        ${env.nodeEnv}
  `);
});

export default app;
