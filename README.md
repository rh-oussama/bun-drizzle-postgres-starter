# Bun + Drizzle + PostgreSQL Starter

A production-ready starter kit for building Express.js APIs with authentication — designed to eliminate repetitive setup across projects.

**Bun** · **TypeScript** · **Express** · **PostgreSQL** · **Drizzle ORM** · **Better Auth**

## Features

- **Authentication** — Email/password + username login via [Better Auth](https://www.better-auth.com)
- **Database** — PostgreSQL with [Drizzle ORM](https://orm.drizzle.team) (type-safe queries, schema-first migrations)
- **Validation** — Request validation with [Zod](https://zod.dev)
- **Security** — Helmet, CORS, rate limiting out of the box
- **API Docs** — Swagger UI at `/docs`, OpenAPI spec at `/docs.json`
- **Testing** — `bun test` with integration test examples
- **Code Quality** — ESLint + Prettier configured
- **CI** — GitHub Actions pipeline (typecheck, lint, format, test)
- **Docker** — Docker Compose for PostgreSQL, Dockerfile for production deployment

## Quick Start

```bash
# Clone the template
git clone https://github.com/rh-oussama/bun-drizzle-postgres-starter.git my-project
cd my-project

# Install dependencies
bun install

# Start PostgreSQL
docker compose up -d

# Configure environment
cp .env.example .env
# Edit .env — at minimum, set a real BETTER_AUTH_SECRET (min 32 chars)

# Generate and run migrations
bun run db:generate
bun run db:migrate

# Start development server
bun run dev
```

Open [http://localhost:3000/api/health](http://localhost:3000/api/health) to verify the server is running.

## API Endpoints

### Auth (Better Auth)

| Method | Endpoint                       | Description             |
| ------ | ------------------------------ | ----------------------- |
| POST   | `/api/auth/sign-up/email`      | Register with email     |
| POST   | `/api/auth/sign-in/email`      | Login with email        |
| POST   | `/api/auth/sign-in/username`   | Login with username     |
| POST   | `/api/auth/sign-out`           | Sign out                |
| GET    | `/api/auth/get-session`        | Get current session     |
| GET    | `/api/auth/ok`                 | Auth health check       |

### Users (Authenticated)

| Method | Endpoint           | Description         |
| ------ | ------------------ | ------------------- |
| GET    | `/api/users/me`    | Get current user    |
| GET    | `/api/users`       | List all users      |
| GET    | `/api/users/:id`   | Get user by ID      |
| PATCH  | `/api/users/:id`   | Update user         |

### Other

| Method | Endpoint       | Description          |
| ------ | -------------- | -------------------- |
| GET    | `/api/health`  | Health check         |
| GET    | `/docs`        | Swagger UI           |
| GET    | `/docs.json`   | OpenAPI JSON spec    |

## Project Structure

```
src/
├── index.ts                    # Entry point — starts the server
├── app.ts                      # Express app — middleware & route wiring
├── config/
│   ├── env.ts                  # Zod-validated environment variables
│   └── swagger.ts              # Swagger/OpenAPI configuration
├── db/
│   ├── index.ts                # Drizzle client instance
│   └── schema/
│       ├── auth.ts             # Auth tables (user, session, account, verification, rate_limit)
│       └── index.ts            # Re-exports all schemas
├── lib/
│   └── auth.ts                 # Better Auth instance configuration
├── middleware/
│   ├── auth.ts                 # requireAuth — session validation
│   ├── validate.ts             # Zod request validation
│   └── error-handler.ts        # Global error handler + error classes
├── features/
│   ├── auth/
│   │   └── auth.routes.ts      # Mounts Better Auth at /api/auth/*
│   ├── health/
│   │   └── health.routes.ts    # GET /api/health
│   └── users/
│       ├── users.routes.ts     # Route definitions
│       ├── users.controller.ts # Request handlers
│       ├── users.service.ts    # Business logic & DB queries
│       └── users.schema.ts     # Zod validation schemas
└── utils/
    └── api-response.ts         # Standardized JSON response helpers
```

## Scripts

| Command                 | Description                           |
| ----------------------- | ------------------------------------- |
| `bun run dev`           | Start dev server with hot reload      |
| `bun run start`         | Start production server               |
| `bun run build`         | Build for production                  |
| `bun run db:generate`   | Generate Drizzle migrations           |
| `bun run db:migrate`    | Apply migrations to database          |
| `bun run db:studio`     | Launch Drizzle Studio (GUI)           |
| `bun run auth:generate` | Regenerate Better Auth Drizzle schema |
| `bun run test`          | Run tests                             |
| `bun run lint`          | Run ESLint                            |
| `bun run format`        | Run Prettier                          |
| `bun run format:check`  | Check formatting                      |
| `bun run typecheck`     | TypeScript type checking              |

## Environment Variables

| Variable             | Required | Description                         | Default                                      |
| -------------------- | -------- | ----------------------------------- | -------------------------------------------- |
| `DATABASE_URL`       | Yes      | PostgreSQL connection string        | `postgresql://postgres:postgres@localhost:5432/starter_db` |
| `BETTER_AUTH_SECRET` | Yes      | Auth secret (min 32 chars)          | —                                            |
| `BETTER_AUTH_URL`    | Yes      | Base URL of the server              | `http://localhost:3000`                       |
| `PORT`               | No       | Server port                         | `3000`                                       |
| `NODE_ENV`           | No       | Environment                         | `development`                                |
| `CORS_ORIGIN`        | No       | Allowed CORS origin(s)              | `http://localhost:5173`                       |

Generate a secure auth secret:

```bash
openssl rand -base64 32
```

## Adding a New Feature

1. Create `src/features/<name>/` with:
   - `<name>.routes.ts` — Express Router
   - `<name>.controller.ts` — Request handlers
   - `<name>.service.ts` — Business logic
   - `<name>.schema.ts` — Zod schemas
2. Register the router in `src/app.ts`
3. Add Swagger JSDoc annotations to routes
4. Write tests in `tests/<name>.test.ts`

## Database Migrations

```bash
# After changing Drizzle schemas:
bun run db:generate    # Generate SQL migration
bun run db:migrate     # Apply to database

# After changing Better Auth config/plugins:
bun run auth:generate  # Regenerate auth schema from Better Auth
bun run db:generate    # Generate migration for changes
bun run db:migrate     # Apply to database
```

## Architecture

See [architecture.md](./architecture.md) for detailed architecture decisions, middleware stack order, and design patterns used in this starter.

## License

MIT
