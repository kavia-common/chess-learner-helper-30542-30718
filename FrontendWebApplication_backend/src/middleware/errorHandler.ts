import { NextFunction, Request, Response } from 'express';

// PUBLIC_INTERFACE
export function notFoundHandler(_req: Request, res: Response) {
  /** Handles 404s for unknown routes. */
  res.status(404).json({ success: false, error: 'Not Found' });
}

// PUBLIC_INTERFACE
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  /** Centralized error handler for uncaught exceptions in routes. */
  // eslint-disable-next-line no-console
  console.error('Error:', err);
  const status = err.status || 500;
  res.status(status).json({ success: false, error: err.message || 'Internal Server Error' });
}
