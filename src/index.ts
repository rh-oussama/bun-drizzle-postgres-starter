import { env } from "./config/env";
import { createApp } from "./app";
import { client } from "./db";

const app = await createApp();

const server = app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log(`Health check: http://localhost:${env.PORT}/api/health`);
  console.log(`Auth check: http://localhost:${env.PORT}/api/auth/ok`);
  if (env.NODE_ENV !== "production") {
    console.log(`API Docs: http://localhost:${env.PORT}/docs`);
  }
});

// ── Graceful shutdown ──
function shutdown() {
  console.log("Shutting down gracefully...");
  server.close(async () => {
    await client.end();
    console.log("Server closed.");
    process.exit(0);
  });

  // Force exit if shutdown takes too long
  setTimeout(() => {
    console.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10_000);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
