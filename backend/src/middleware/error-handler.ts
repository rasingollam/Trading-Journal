import type { Request, Response, NextFunction } from "express";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error("Unhandled error:", err);
  const message = err.message || "Internal Server Error";
  const status = (err as any).status || (err as any).statusCode || 500;
  res.status(status).json({ error: message });
}
