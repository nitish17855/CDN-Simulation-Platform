import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import env from './env.js';
import * as schema from '../db/schema.js';

const connectionString = env.databaseUrl;

// Connection for queries (pooled)
const queryClient = postgres(connectionString);

// Drizzle instance
const db = drizzle(queryClient, { schema });

export { db, queryClient };
