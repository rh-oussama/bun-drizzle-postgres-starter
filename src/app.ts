import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { swaggerSpec } from "./config/swagger";
import { errorHandler } from "./middleware/error-handler";
import authRoutes from "./features/auth/auth.routes";
import healthRoutes from "./features/health/health.routes";
import usersRoutes from "./features/users/users.routes";

export function createApp() {
  const app = express();

  // ── Auth routes MUST be mounted BEFORE express.json() ──
  // Otherwise Better Auth API calls will hang on "pending"
  app.use("/api/auth", authRoutes);

  // ── Global middleware ──
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );
  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      limit: 100,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      message: {
        success: false,
        error: {
          message: "Too many requests, please try again later",
          code: "RATE_LIMIT_EXCEEDED",
        },
      },
    }),
  );

  // ── Feature routes ──
  app.use("/api/health", healthRoutes);
  app.use("/api/users", usersRoutes);

  // ── API Documentation ──
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  // ── Global error handler (must be last) ──
  app.use(errorHandler);

  return app;
}
