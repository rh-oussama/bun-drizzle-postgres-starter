import { z } from "zod";

export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
  }),
});
