import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../../lib/auth";

const router = Router();

/**
 * @openapi
 * /api/auth/{path}:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Better Auth endpoints
 *     description: |
 *       All authentication is handled by Better Auth.
 *       Key endpoints:
 *       - POST /api/auth/sign-up/email — Register with email/password (+ username)
 *       - POST /api/auth/sign-in/email — Login with email/password
 *       - POST /api/auth/sign-in/username — Login with username/password
 *       - POST /api/auth/sign-out — Logout
 *       - GET /api/auth/ok — Health check
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Auth response
 *   post:
 *     tags:
 *       - Auth
 *     summary: Better Auth endpoints
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Auth response
 */
router.all("/*", toNodeHandler(auth));

export default router;
