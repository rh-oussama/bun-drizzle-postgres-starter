import { Router } from "express";
import { sendSuccess } from "../../utils/api-response";

const router = Router();

router.get("/", (_req, res) => {
  sendSuccess(res, {
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
