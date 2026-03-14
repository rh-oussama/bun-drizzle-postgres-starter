import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Bun Drizzle Postgres Starter API",
      version: "1.0.0",
      description: "Express API with Better Auth, Drizzle ORM, and PostgreSQL",
    },
    servers: [
      {
        url: "http://localhost:3000",
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
  },
  apis: ["./src/features/**/*.routes.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
