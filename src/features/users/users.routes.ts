import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { getUserByIdSchema, updateUserSchema } from "./users.schema";
import * as usersController from "./users.controller";

const router = Router();

// All user routes require authentication
router.use(requireAuth);

router.get(
  "/me",
  asyncHandler((req, res) => usersController.getMe(req as AuthenticatedRequest, res)),
);

router.get(
  "/",
  asyncHandler((req, res) => usersController.getAllUsers(req as AuthenticatedRequest, res)),
);

router.get(
  "/:id",
  validate(getUserByIdSchema),
  asyncHandler((req, res) => usersController.getUserById(req as AuthenticatedRequest, res)),
);

router.patch(
  "/:id",
  validate(updateUserSchema),
  asyncHandler((req, res) => usersController.updateUser(req as AuthenticatedRequest, res)),
);

export default router;
