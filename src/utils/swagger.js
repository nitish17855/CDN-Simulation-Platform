import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

/**
 * ==============================================================================
 * SWAGGER / OPENAPI 3.0 CONFIGURATION
 * ==============================================================================
 * WHAT WE FIXED & ADDED:
 * 1. Updated `apis` glob pattern from `./src/routes/*.js` to `./src/route/*.js` to match folder structure.
 * 2. Added `securitySchemes` for `BearerAuth` (JWT) so developers can paste Bearer tokens
 *    directly into the Swagger UI interface to test protected endpoints and RBAC.
 * 
 * WHY USE SWAGGER:
 * - Interactive API documentation: Allows easy testing of endpoints without third-party tools like Postman.
 * - Standardized OpenAPI Specification: Generates machine-readable API contracts.
 */

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CDN Backend API',
      version: '1.0.0',
      description: 'CDN Backend REST API with Express, PostgreSQL, Redis, JWT Authentication, and RBAC',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      // Configure JWT Bearer Authentication in Swagger UI
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>',
        },
      },
    },
  },
  apis: ['./src/route/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * Mounts Swagger UI middleware to the Express application.
 * 
 * @param {import('express').Express} app - Express application instance
 */
const setupSwagger = (app) => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'CDN API Docs',
    })
  );
};

export default setupSwagger;
