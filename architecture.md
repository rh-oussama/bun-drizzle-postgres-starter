# Architecture

## Overview

A reusable starter kit for building Express.js APIs with authentication, designed to eliminate repetitive setup work across projects.

**Stack:** Bun + TypeScript + Express + PostgreSQL + Drizzle ORM + Better Auth + Docker Compose

---

## Tech Stack

| Layer            | Technology                                      |
| ---------------- | ----------------------------------------------- |
| Runtime          | Bun (TypeScript, ESM)                           |
| Framework        | Express                                         |
| Database         | PostgreSQL 16 (via Docker Compose)              |
| ORM              | Drizzle ORM + Drizzle Kit                       |
| Authentication   | Better Auth (email/password + username plugin)  |
| Validation       | Zod                                             |
| Security         | Helmet, CORS, express-rate-limit                |
| API Docs         | swagger-ui-express (plain object spec)          |
| Testing          | bun test (built-in, Jest-compatible)            |
| Linting          | ESLint + Prettier                               |
| CI/CD            | GitHub Actions                                  |
| Containerization | Docker Compose (PostgreSQL)                     |

---

## Project Structure

```
├── docker-compose.yml              # PostgreSQL container
├── Dockerfile                      # Optional: containerized app deployment
├── .env.example                    # Environment variable template
├── .github/
│   └── workflows/
│       └── ci.yml                  # Lint, typecheck, test pipeline
├── package.json
├── tsconfig.json
├── drizzle.config.ts               # Drizzle Kit configuration
├── eslint.config.js                # ESLint flat config
├── .prettierrc                     # Prettier config
│
├── src/
│   ├── index.ts                    # Entry point — starts the server
│   ├── app.ts                      # Express app — registers middleware & routes
│   │
│   ├── config/
│   │   ├── env.ts                  # Zod-validated environment variables
│   │   └── swagger.ts              # Swagger/OpenAPI configuration
│   │
│   ├── db/
│   │   ├── index.ts                # Drizzle client instance (pg connection)
│   │   └── schema/
│   │       ├── auth.ts             # Better Auth tables (user, session, account, verification)
│   │       └── index.ts            # Re-exports all schemas
│   │
│   ├── lib/
│   │   └── auth.ts                 # Better Auth instance configuration
│   │
│   ├── middleware/
│   │   ├── auth.ts                 # requireAuth — session validation middleware
│   │   ├── validate.ts             # Zod request validation middleware
│   │   └── error-handler.ts        # Global error handler
│   │
│   ├── routes/
│   │   ├── auth.routes.ts          # Mounts Better Auth at /api/auth/*
│   │   ├── health.routes.ts        # GET /api/health
│   │   └── users.routes.ts         # User CRUD route definitions
│   │
│   ├── controllers/
│   │   └── users.controller.ts     # Request handlers
│   │
│   ├── services/
│   │   └── users.service.ts        # Business logic & DB queries
│   │
│   ├── schemas/
│   │   └── users.schema.ts         # Zod schemas for request/response
│   │
│   └── utils/
│       ├── api-response.ts         # Standardized JSON response helpers
│       └── async-handler.ts        # Async error wrapper for Express 4
│
└── tests/
    ├── setup.test.ts               # Sanity check test
    └── health.test.ts              # Health endpoint integration test
```

---

## Architecture Decisions

### 1. Traditional Express Structure (Group by Type)

Code is organized by layer — routes, controllers, services, and schemas each have their own directory:

```
src/
├── routes/               # Route definitions (Express Routers)
├── controllers/          # HTTP layer — parse request, call service, send response
├── services/             # Business logic — interact with DB via Drizzle
└── schemas/              # Zod schemas for request validation
```

**Convention:** Adding a new feature means adding files to each layer directory and registering the router in `app.ts`.

### 2. Better Auth Integration

Better Auth handles all authentication logic (signup, login, session management, password hashing).

- **Auth instance** lives in `src/lib/auth.ts`
- **Mounted in Express** via `toNodeHandler(auth)` at `/api/auth/*`
- **Must be mounted BEFORE `express.json()`** — otherwise auth API calls hang
- **Session access** in other routes via `auth.api.getSession({ headers: fromNodeHeaders(req.headers) })`

**Plugins enabled:**
- `emailAndPassword` — signup/login with email + password
- `username` — adds username field to user, enables login by username

**Auth tables** (managed by Better Auth + Drizzle):

| Table          | Purpose                                    |
| -------------- | ------------------------------------------ |
| `user`         | User profile (name, email, username, etc.) |
| `session`      | Active sessions (token, expiry)            |
| `account`      | Auth providers (credential, oauth, etc.)   |
| `verification` | Email verification & password reset tokens |
| `rate_limit`   | Better Auth rate limiting state            |

### 3. Middleware Stack (Order Matters)

```
1. Helmet                 → Security headers
2. CORS                   → Cross-origin config
3. Rate limiter           → Request throttling
4. Better Auth handler    → /api/auth/* (before express.json)
5. express.json()         → Parse JSON bodies
6. Application routes     → /api/users, /api/health, etc.
7. Swagger UI             → /docs
8. Global error handler   → Catches all unhandled errors
```

### 4. Environment Configuration

All env variables are validated at startup using Zod in `src/config/env.ts`. The app fails fast with clear error messages if any required variable is missing or invalid.

**Required variables:**

| Variable             | Description                  | Example                                      |
| -------------------- | ---------------------------- | -------------------------------------------- |
| `DATABASE_URL`       | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/mydb`  |
| `BETTER_AUTH_SECRET` | Auth secret (min 32 chars)   | `openssl rand -base64 32`                    |
| `BETTER_AUTH_URL`    | Base URL of the server       | `http://localhost:3000`                       |
| `PORT`               | Server port                  | `3000`                                        |
| `CORS_ORIGIN`        | Allowed CORS origin(s)       | `http://localhost:5173`                       |

### 5. Database & Migrations

- **Drizzle ORM** for type-safe queries
- **Drizzle Kit** for schema-first migrations
- **PostgreSQL 16** via Docker Compose (no local install needed)

**Migration workflow:**

```bash
# After changing schemas:
bun run db:generate    # Generate migration SQL
bun run db:migrate     # Apply to database

# After changing Better Auth config/plugins:
bun run auth:generate  # Regenerate auth schema
bun run db:generate    # Then generate migration
bun run db:migrate     # Then apply
```

### 6. Validation Pattern

Zod schemas define the shape of request bodies, query params, and route params. The `validate` middleware applies them:

```ts
// users.schema.ts
export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
  }),
});

// users.routes.ts
router.post("/", validate(createUserSchema), usersController.create);
```

### 7. API Response Format

All endpoints return a consistent JSON shape:

```json
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "VALIDATION_ERROR"
  }
}
```

### 8. Error Handling

- Feature-level errors throw typed errors (`AppError`, `NotFoundError`, `ConflictError`, `ForbiddenError`)
- The global error handler in `middleware/error-handler.ts` catches everything
- In development: full stack traces
- In production: sanitized error messages

### 9. Testing

- **Runner:** `bun test` (built-in, Jest-compatible API)
- **Test files:** `tests/*.test.ts`
- **Pattern:** Integration tests that spin up the Express app and make HTTP requests

### 10. Security

| Middleware             | Purpose                                       |
| ---------------------- | --------------------------------------------- |
| `helmet`               | Sets security HTTP headers                    |
| `cors`                 | Configures allowed origins, credentials       |
| `express-rate-limit`   | Rate limits requests (100/15min default)       |
| Better Auth (built-in) | Password hashing (scrypt), CSRF, session mgmt |

### 11. API Documentation

Swagger UI served at `/docs`, raw spec at `/docs.json`. OpenAPI spec is defined as a plain object in `src/config/swagger.ts`. Only loaded in non-production environments via dynamic import.

---

## Scripts

| Command                | Description                          |
| ---------------------- | ------------------------------------ |
| `bun run dev`          | Start dev server with hot reload     |
| `bun run build`        | Build for production                 |
| `bun run start`        | Start production server              |
| `bun run db:generate`  | Generate Drizzle migrations          |
| `bun run db:migrate`   | Apply migrations to database         |
| `bun run db:studio`    | Launch Drizzle Studio (GUI)          |
| `bun run auth:generate`| Regenerate Better Auth Drizzle schema|
| `bun run test`         | Run tests with bun test              |
| `bun run lint`         | Run ESLint                           |
| `bun run format`       | Run Prettier                         |
| `bun run typecheck`    | TypeScript type checking             |

---

## Getting Started

```bash
# 1. Clone the template
git clone https://github.com/rh-oussama/bun-drizzle-postgres-starter.git my-project
cd my-project

# 2. Install dependencies
bun install

# 3. Start PostgreSQL
docker compose up -d

# 4. Configure environment
cp .env.example .env
# Edit .env — set BETTER_AUTH_SECRET, DATABASE_URL, etc.

# 5. Run migrations
bun run db:migrate

# 6. Start development server
bun run dev

# 7. Verify
# GET http://localhost:3000/api/health
# GET http://localhost:3000/api/auth/ok
# GET http://localhost:3000/docs
```

---

## Adding a New Feature

1. Add route file: `src/routes/<name>.routes.ts`
2. Add controller: `src/controllers/<name>.controller.ts`
3. Add service: `src/services/<name>.service.ts`
4. Add validation schemas: `src/schemas/<name>.schema.ts`
5. Register the router in `src/app.ts`
6. Add OpenAPI spec entries in `src/config/swagger.ts`
7. Write tests in `tests/<name>.test.ts`
