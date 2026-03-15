import { env } from "./env";

export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Bun Drizzle Postgres Starter API",
    version: "1.0.0",
    description: "Express API with Better Auth, Drizzle ORM, and PostgreSQL",
  },
  servers: [
    {
      url: env.BETTER_AUTH_URL,
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "better-auth.session_token",
        description: "Session cookie set by Better Auth after login",
      },
    },
  },
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        description: "Returns server health status, uptime, and database connectivity",
        responses: {
          "200": {
            description: "Server is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        status: { type: "string", example: "ok" },
                        uptime: { type: "number" },
                        timestamp: { type: "string", format: "date-time" },
                        database: { type: "string", example: "ok" },
                      },
                    },
                  },
                },
              },
            },
          },
          "503": {
            description: "Server is degraded (database unreachable)",
          },
        },
      },
    },
    "/api/auth/{path}": {
      get: {
        tags: ["Auth"],
        summary: "Better Auth endpoints",
        description: [
          "All authentication is handled by Better Auth.",
          "Key endpoints:",
          "- POST /api/auth/sign-up/email — Register with email/password (+ username)",
          "- POST /api/auth/sign-in/email — Login with email/password",
          "- POST /api/auth/sign-in/username — Login with username/password",
          "- POST /api/auth/sign-out — Logout",
          "- GET /api/auth/ok — Health check",
        ].join("\n"),
        parameters: [
          {
            in: "path",
            name: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Auth response" },
        },
      },
      post: {
        tags: ["Auth"],
        summary: "Better Auth endpoints",
        parameters: [
          {
            in: "path",
            name: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Auth response" },
        },
      },
    },
    "/api/users/me": {
      get: {
        tags: ["Users"],
        summary: "Get current user profile",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": { description: "Current user data" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "List all users (paginated)",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "page",
            schema: { type: "integer", minimum: 1, default: 1 },
            description: "Page number",
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            description: "Number of items per page",
          },
        ],
        responses: {
          "200": {
            description: "Paginated list of users",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        users: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id: { type: "string" },
                              name: { type: "string" },
                              email: { type: "string" },
                              username: { type: "string" },
                              displayUsername: { type: "string" },
                              image: { type: "string", nullable: true },
                              createdAt: { type: "string", format: "date-time" },
                            },
                          },
                        },
                        pagination: {
                          type: "object",
                          properties: {
                            page: { type: "integer", example: 1 },
                            limit: { type: "integer", example: 20 },
                            total: { type: "integer", example: 50 },
                            totalPages: { type: "integer", example: 3 },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user by ID",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "User data" },
          "404": { description: "User not found" },
          "401": { description: "Unauthorized" },
        },
      },
      patch: {
        tags: ["Users"],
        summary: "Update user profile",
        description: "Users can only update their own profile",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Updated user data" },
          "403": { description: "Forbidden — can only update own profile" },
          "404": { description: "User not found" },
          "401": { description: "Unauthorized" },
        },
      },
    },
  },
};
