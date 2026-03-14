import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";

type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
type NonNullAuthSession = NonNullable<AuthSession>;

export interface AuthenticatedRequest extends Request {
  user: NonNullAuthSession["user"];
  session: NonNullAuthSession["session"];
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      res.status(401).json({
        success: false,
        error: {
          message: "Unauthorized — no valid session",
          code: "UNAUTHORIZED",
        },
      });
      return;
    }

    (req as AuthenticatedRequest).user = session.user;
    (req as AuthenticatedRequest).session = session.session;
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: {
        message: "Unauthorized — session validation failed",
        code: "UNAUTHORIZED",
      },
    });
  }
}
