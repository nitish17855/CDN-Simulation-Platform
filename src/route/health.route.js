import { Router } from 'express';
import { db } from '../config/database.js';
import redis from '../config/redis.js';
import { sql } from 'drizzle-orm';

/**
 * ==============================================================================
 * HEALTH CHECK ROUTES
 * ==============================================================================
 * WHAT THIS FILE DOES:
 * Provides an operational health check endpoint to verify backend service,
 * database connectivity (PostgreSQL / Drizzle), and Redis cache status.
 * 
 * WHY USE A HEALTH CHECK ROUTE:
 * Essential for Docker container orchestration, Kubernetes probes, and monitoring uptime.
 */
const router = Router();

/**
 * @route   GET /api/health
 * @desc    Check API, Database, and Redis health status
 * @access  Public
 */
router.get('/', async (req, res) => {
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      api: 'healthy',
      database: 'unknown',
      redis: 'unknown',
    },
  };

  // Check Database connection
  try {
    await db.execute(sql`SELECT 1`);
    healthStatus.services.database = 'connected';
  } catch (dbError) {
    healthStatus.services.database = 'disconnected';
    healthStatus.status = 'degraded';
  }

  // Check Redis connection
  try {
    const ping = await redis.ping();
    healthStatus.services.redis = ping === 'PONG' ? 'connected' : 'disconnected';
  } catch (redisError) {
    healthStatus.services.redis = 'disconnected';
    healthStatus.status = 'degraded';
  }

  const statusCode = healthStatus.status === 'ok' ? 200 : 503;
  return res.status(statusCode).json(healthStatus);
});

export default router;
