import { Router } from "express";
import { client } from "../db";
import { sendSuccess } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    let dbStatus = "ok";
    try {
      await client`SELECT 1`;
    } catch {
      dbStatus = "error";
    }

    const status = dbStatus === "ok" ? "ok" : "degraded";
    const statusCode = dbStatus === "ok" ? 200 : 503;

    sendSuccess(
      res,
      {
        status,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: dbStatus,
      },
      statusCode,
    );
  }),
);

export default router;
