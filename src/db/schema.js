import { pgTable, uuid, varchar, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

/**
 * ==============================================================================
 * ROLE DEFINITIONS (RBAC)
 * ==============================================================================
 * WHY:
 * We define standard application roles in a single constant object (ROLES) to avoid
 * magic strings throughout the codebase. This ensures consistency when checking roles
 * in RBAC middleware, assigning default roles, and validating user permissions.
 */
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
};

/**
 * ==============================================================================
 * NODE STATUS CONSTANTS
 * ==============================================================================
 * WHY:
 * Standardize status states across Edge and Origin nodes (ACTIVE, INACTIVE, MAINTENANCE, OFFLINE)
 * to avoid hardcoded strings across simulation and service layers.
 */
export const NODE_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  MAINTENANCE: 'MAINTENANCE',
  OFFLINE: 'OFFLINE',
};

/**
 * ==============================================================================
 * USER TABLE SCHEMA
 * ==============================================================================
 * WHAT WE FIXED & ADDED:
 * 1. Added `role` column with default 'user' to support Role-Based Access Control (RBAC).
 * 2. Exported `users` table representation using Drizzle ORM pgTable.
 * 
 * WHY EACH FIELD IS USED:
 * - `id`: UUID primary key with automatic random UUID generation (`defaultRandom()`)
 *   for globally unique, secure identifiers that don't leak sequence counts.
 * - `name`: User's full name, varchar(255), notNull.
 * - `email`: Unique email identifier for login/authentication, varchar(255), notNull.
 * - `password`: Bcrypt hashed password string, varchar(255), notNull.
 * - `role`: User's access control role ('user', 'admin', etc.). Defaults to 'user'.
 *   This field is loaded into the JWT payload and checked by RBAC middleware.
 * - `createdAt` / `updatedAt`: Timestamps with timezone support for auditing and tracking.
 */
export const users = pgTable('userTable', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default(ROLES.USER),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * ==============================================================================
 * EDGE NODES TABLE SCHEMA
 * ==============================================================================
 * Represents Points of Presence (PoPs) / Edge caching servers distributed geographically.
 * 
 * FIELDS:
 * - `id`: Unique identifier (UUID primary key)
 * - `name`: Edge node server name / identifier (e.g., 'Edge-Delhi-01')
 * - `location`: Geographical location or region (e.g., 'Delhi', 'Mumbai', 'ap-south-1')
 * - `status`: Operational status ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'OFFLINE')
 * - `createdAt` / `updatedAt`: Timestamp auditing fields with timezone support
 */
export const edgeNodes = pgTable('edge_nodes', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default(NODE_STATUS.ACTIVE),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * ==============================================================================
 * ORIGIN NODES TABLE SCHEMA
 * ==============================================================================
 * Represents authoritative centralized origin storage/servers containing master content.
 * 
 * FIELDS:
 * - `id`: Unique identifier (UUID primary key)
 * - `name`: Origin server name (e.g., 'Origin-Primary-Bangalore')
 * - `location`: Geographical location or data center region (e.g., 'Bangalore')
 * - `status`: Operational status ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'OFFLINE')
 * - `createdAt` / `updatedAt`: Timestamp auditing fields with timezone support
 */
export const originNodes = pgTable('origin_nodes', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default(NODE_STATUS.ACTIVE),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * ==============================================================================
 * CACHE POLICIES TABLE SCHEMA
 * ==============================================================================
 * Represents caching behavior, TTL rules, and activation settings for CDN content.
 * 
 * FIELDS:
 * - `id`: Unique identifier (UUID primary key)
 * - `name`: Policy name (e.g., 'Static Assets Cache', 'API Short-lived')
 * - `ttlSeconds`: Time-To-Live duration in seconds for cached assets (integer)
 * - `isActive`: Flag indicating whether the policy is currently active (boolean)
 * - `createdAt` / `updatedAt`: Timestamp auditing fields with timezone support
 */
export const cachePolicies = pgTable('cache_policies', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  ttlSeconds: integer('ttl_seconds').notNull().default(3600),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Snake_case aliases for direct matching with database table names
export const edge_nodes = edgeNodes;
export const origin_nodes = originNodes;
export const cache_policies = cachePolicies;

