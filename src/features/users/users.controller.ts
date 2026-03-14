import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth";
import { sendSuccess, sendError } from "../../utils/api-response";
import * as usersService from "./users.service";

export async function getMe(req: AuthenticatedRequest, res: Response) {
  const user = await usersService.findUserById(req.user.id);

  if (!user) {
    return sendError(res, "User not found", "NOT_FOUND", 404);
  }

  return sendSuccess(res, user);
}

export async function getUserById(req: AuthenticatedRequest, res: Response) {
  const id = req.params.id as string;
  const user = await usersService.findUserById(id);

  if (!user) {
    return sendError(res, "User not found", "NOT_FOUND", 404);
  }

  return sendSuccess(res, user);
}

export async function getAllUsers(_req: AuthenticatedRequest, res: Response) {
  const users = await usersService.findAllUsers();
  return sendSuccess(res, users);
}

export async function updateUser(req: AuthenticatedRequest, res: Response) {
  const id = req.params.id as string;

  // Users can only update their own profile
  if (id !== req.user.id) {
    return sendError(res, "Forbidden — can only update your own profile", "FORBIDDEN", 403);
  }

  const updated = await usersService.updateUser(id, req.body);

  if (!updated) {
    return sendError(res, "User not found", "NOT_FOUND", 404);
  }

  return sendSuccess(res, updated);
}
