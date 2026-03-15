import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error-handler";
import authRoutes from "./features/auth/auth.routes";
import healthRoutes from "./features/health/health.routes";
import usersRoutes from "./features/users/users.routes";

export async function createApp() {
  const app = express();

  // ── Security middleware (applies to ALL routes including auth) ──
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

  // ── Auth routes MUST be mounted BEFORE express.json() ──
  // Better Auth parses its own request bodies; express.json() interferes
  app.use("/api/auth", authRoutes);

  // ── Body parsing (after auth routes) ──
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true }));

  // ── Feature routes ──
  app.use("/api/health", healthRoutes);
  app.use("/api/users", usersRoutes);

  // ── API Documentation (development only) ──
  if (env.NODE_ENV !== "production") {
    const swaggerUi = await import("swagger-ui-express");
    const { swaggerSpec } = await import("./config/swagger");
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get("/docs.json", (_req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerSpec);
    });
  }

  // ── Global error handler (must be last) ──
  app.use(errorHandler);

  return app;
}
