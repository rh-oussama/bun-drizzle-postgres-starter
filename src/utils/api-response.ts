import type { Response } from "express";

interface SuccessResponse<T> {
  success: true;
  data: T;
}

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200) {
  const response: SuccessResponse<T> = { success: true, data };
  res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  message: string,
  code: string,
  statusCode = 500,
  details?: unknown,
) {
  const response: ErrorResponse = {
    success: false,
    error: { message, code, ...(details !== undefined ? { details } : {}) },
  };
  res.status(statusCode).json(response);
}
