import type { Request, Response, NextFunction } from "express";

/**
 * Wraps an async route handler so rejected promises are forwarded
 * to Express's global error handler instead of silently hanging.
 *
 * Express 4.x does not handle rejected promises from route handlers.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
