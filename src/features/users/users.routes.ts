import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { getUserByIdSchema, updateUserSchema } from "./users.schema";
import * as usersController from "./users.controller";

const router = Router();

// All user routes require authentication
router.use(requireAuth);

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get current user profile
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         description: Unauthorized
 */
router.get("/me", (req, res) => usersController.getMe(req as AuthenticatedRequest, res));

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: List all users
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 */
router.get("/", (req, res) => usersController.getAllUsers(req as AuthenticatedRequest, res));

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user by ID
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User data
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", validate(getUserByIdSchema), (req, res) =>
  usersController.getUserById(req as AuthenticatedRequest, res),
);

/**
 * @openapi
 * /api/users/{id}:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Update user profile
 *     description: Users can only update their own profile
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated user data
 *       403:
 *         description: Forbidden — can only update own profile
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.patch("/:id", validate(updateUserSchema), (req, res) =>
  usersController.updateUser(req as AuthenticatedRequest, res),
);

export default router;
