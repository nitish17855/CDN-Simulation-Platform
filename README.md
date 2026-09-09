# CDN Backend API

Express.js backend with PostgreSQL, Redis, Drizzle ORM, JWT Authentication, and Role-Based Access Control (RBAC).

## Quick Start

### 1. Start Docker services

```bash
docker compose up -d
```

This starts **PostgreSQL 16** (port 5432) and **Redis 7** (port 6379).

### 2. Install dependencies

```bash
npm install
```

### 3. Push database schema

```bash
npm run db:push
```

### 4. Start the dev server

```bash
npm run dev
```

Server runs on [http://localhost:3000](http://localhost:3000)

---

## API Endpoints

### Authentication (`/api/auth`)
| Method | Route | Description | Auth | Roles Allowed |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user (with role) | Public | Anyone |
| `POST` | `/api/auth/login` | Login with credentials & get JWT | Public | Anyone |
| `GET` | `/api/auth/me` | Get current user's profile | Bearer Token | `user`, `admin`, `moderator` |

### User Management & RBAC (`/api/users`)
| Method | Route | Description | Auth | Roles Allowed |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | List all users in system | Bearer Token | `admin` |
| `GET` | `/api/users/admin/dashboard` | Admin dashboard statistics | Bearer Token | `admin` |
| `GET` | `/api/users/:id` | Get user profile by ID | Bearer Token | All authenticated |
| `PATCH` | `/api/users/:id/role` | Update user role | Bearer Token | `admin` |

### System (`/api/health`)
| Method | Route | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Health check (DB + Redis status) | Public |

---

## Role-Based Access Control (RBAC)

Supported roles:
- `user` (Default)
- `admin`
- `moderator`

### How RBAC Works:
1. **Authentication**: `authenticate` middleware in `src/middleware/auth.middleware.js` verifies the JWT token from the `Authorization: Bearer <token>` header and attaches user data to `req.user`.
2. **Authorization**: `authorize('admin')` middleware in `src/middleware/rbac.middleware.js` checks if `req.user.role` matches the permitted roles. If not, it rejects the request with `403 Forbidden`.

---

## API Documentation

Swagger UI is available at [http://localhost:3000/api-docs](http://localhost:3000/api-docs) with built-in JWT Bearer token support.

---

## Folder Structure

```
src/
├── config/          # Database, Redis, and environment configs
├── controllers/     # HTTP Request/Response handlers (auth.controller, user.controller)
├── db/              # Drizzle ORM schema definitions (schema.js)
├── error/           # Custom error classes (Unauthorized, Forbidden, InvalidCredentials)
├── middleware/      # JWT authentication (auth.middleware) and RBAC (rbac.middleware)
├── repository/      # Data access layer using Drizzle ORM (user.repository)
├── route/           # Express route definitions (auth.route, user.route, health.route)
├── service/         # Business logic layer (auth.service, user.service)
├── utils/           # Utilities (jwt.js, swagger.js)
└── index.js         # Server entry point
```

---

## Environment Variables

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

| Variable | Default |
| :--- | :--- |
| `PORT` | `3000` |
| `NODE_ENV` | `development` |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/cdn_db` |
| `REDIS_URL` | `redis://localhost:6379` |
| `JWT_SECRET` | (change this in production!) |
| `JWT_EXPIRES_IN` | `7d` |

---

## Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Start dev server with auto-reload |
| `npm start` | Start production server |
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate migration files |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Drizzle Studio (DB GUI) |
