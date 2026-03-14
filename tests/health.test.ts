import { describe, it, expect, beforeAll } from "bun:test";

// Set required env vars before importing the app
beforeAll(() => {
  process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/starter_db";
  process.env.BETTER_AUTH_SECRET = "test-secret-that-is-at-least-32-characters-long";
  process.env.BETTER_AUTH_URL = "http://localhost:3000";
  process.env.PORT = "0";
  process.env.NODE_ENV = "test";
  process.env.CORS_ORIGIN = "http://localhost:5173";
});

describe("Health endpoint", () => {
  it("should return health status", async () => {
    const { createApp } = await import("../src/app");
    const app = createApp();

    const response = await new Promise<{ status: number; body: Record<string, unknown> }>(
      (resolve) => {
        const server = app.listen(0, () => {
          const address = server.address();
          const port = typeof address === "object" && address ? address.port : 0;

          fetch(`http://localhost:${port}/api/health`)
            .then(async (res) => {
              const body = (await res.json()) as Record<string, unknown>;
              resolve({ status: res.status, body });
              server.close();
            })
            .catch(() => {
              resolve({ status: 500, body: {} });
              server.close();
            });
        });
      },
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
