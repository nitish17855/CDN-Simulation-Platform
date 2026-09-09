import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

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
