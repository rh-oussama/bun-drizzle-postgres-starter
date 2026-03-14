import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { getUserByIdSchema, updateUserSchema } from "./users.schema";
import * as usersController from "./users.controller";

const router = Router();

// All user routes require authentication
router.use(requireAuth);

router.get("/me", (req, res) => usersController.getMe(req as AuthenticatedRequest, res));

router.get("/", (req, res) => usersController.getAllUsers(req as AuthenticatedRequest, res));

router.get("/:id", validate(getUserByIdSchema), (req, res) =>
  usersController.getUserById(req as AuthenticatedRequest, res),
);

router.patch("/:id", validate(updateUserSchema), (req, res) =>
  usersController.updateUser(req as AuthenticatedRequest, res),
);

export default router;
