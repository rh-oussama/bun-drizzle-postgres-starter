import { eq, count } from "drizzle-orm";
import { db } from "../db";
import { user } from "../db/schema";

export async function findUserById(id: string) {
  const result = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      displayUsername: user.displayUsername,
      image: user.image,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
    .from(user)
    .where(eq(user.id, id))
    .limit(1);

  return result[0] ?? null;
}

export async function findAllUsers(page: number, limit: number) {
  const offset = (page - 1) * limit;

  const [users, totalResult] = await Promise.all([
    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        displayUsername: user.displayUsername,
        image: user.image,
        createdAt: user.createdAt,
      })
      .from(user)
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(user),
  ]);

  const total = totalResult[0]?.count ?? 0;

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateUser(id: string, data: { name?: string }) {
  const result = await db
    .update(user)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(user.id, id))
    .returning({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      displayUsername: user.displayUsername,
      image: user.image,
      updatedAt: user.updatedAt,
    });

  return result[0] ?? null;
}
