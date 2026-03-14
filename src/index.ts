import { env } from "./config/env";
import { createApp } from "./app";

const app = await createApp();

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log(`Health check: http://localhost:${env.PORT}/api/health`);
  console.log(`Auth check: http://localhost:${env.PORT}/api/auth/ok`);
  if (env.NODE_ENV !== "production") {
    console.log(`API Docs: http://localhost:${env.PORT}/docs`);
  }
});
